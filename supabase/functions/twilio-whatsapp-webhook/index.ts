import { createClient } from "npm:@supabase/supabase-js@2";

const xml = (value: string) => value.replace(/[<>&"']/g, (c) =>
  ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c] ?? c);
const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const reply = (message: string, status = 200) => new Response(
  `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${xml(message)}</Message></Response>`,
  { status, headers: { "Content-Type": "text/xml; charset=utf-8", "Cache-Control": "no-store" } },
);
const reject = (status: number) => new Response("Unauthorized", { status });

async function validTwilioSignature(request: Request, params: URLSearchParams, authToken: string): Promise<boolean> {
  const signature = request.headers.get("X-Twilio-Signature");
  const webhookUrl = Deno.env.get("TWILIO_WEBHOOK_URL");
  if (!signature || !webhookUrl || !authToken) return false;
  // Twilio assina URL pública exata + parâmetros POST ordenados alfabeticamente.
  const signed = webhookUrl + [...params.keys()].sort().map((key) => key + (params.get(key) ?? "")).join("");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(authToken), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed)));
  const actual = btoa(String.fromCharCode(...bytes));
  if (actual.length !== signature.length) return false;
  let difference = 0;
  for (let i = 0; i < actual.length; i++) difference |= actual.charCodeAt(i) ^ signature.charCodeAt(i);
  return difference === 0;
}

type Product = { nome?: string; preco?: number; descricao?: string };
type Faq = { pergunta?: string; resposta?: string };
type Hours = { dia?: string; aberto?: boolean; abre?: string; fecha?: string };
function answer(question: string, products: Product[], faqs: Faq[], hours: Hours[]): string {
  const q = normalize(question);
  if (!q) return "Olá! Como posso ajudar?";
  const faq = faqs.find((f) => {
    const key = normalize(f.pergunta ?? "");
    const words = key.split(" ").filter((w) => w.length > 3);
    return key === q || (words.length > 0 && words.filter((w) => q.includes(w)).length / words.length >= 0.75);
  });
  if (faq?.resposta) return faq.resposta;
  const product = products.find((p) => {
    const name = normalize(p.nome ?? "");
    return name.length > 2 && (q.includes(name) || name.split(" ").filter((w) => w.length > 4).some((w) => q.includes(w)));
  });
  if (product) {
    if (/preco|valor|custa|quanto/.test(q) && typeof product.preco === "number")
      return `${product.nome} custa ${product.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`;
    return [product.nome, product.descricao].filter(Boolean).join(" — ") + ".";
  }
  if (/horario|abre|aberto|fecha|funciona/.test(q)) {
    const day = hours.find((h) => {
      const d = normalize(h.dia ?? "");
      return d.length > 2 && (q.includes(d) || q.includes(d.split(" ")[0]));
    });
    if (day) return day.aberto ? `Sim, ${day.dia}: das ${day.abre} às ${day.fecha}.` : `Não abrimos ${day.dia}.`;
    return hours.length ? hours.map((h) => h.aberto ? `${h.dia}: ${h.abre} às ${h.fecha}` : `${h.dia}: fechado`).join("\n") : "Ainda não temos horários cadastrados.";
  }
  if (/^(oi|ola|bom dia|boa tarde|boa noite)/.test(q)) return "Olá! 👋 Bem-vindo à Pizzaria do Pedro! Como posso ajudar?";
  return "Posso ajudar com nosso cardápio, preços e horários. Qual informação você procura?";
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Método não permitido", { status: 405 });
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/x-www-form-urlencoded")) return new Response("Formato inválido", { status: 415 });
  const raw = await req.text();
  if (raw.length > 20000) return new Response("Mensagem muito grande", { status: 413 });
  const form = new URLSearchParams(raw);
  const token = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
  if (!await validTwilioSignature(req, form, token)) return reject(403);
  const to = form.get("To") ?? "";
  const from = form.get("From") ?? "";
  const message = (form.get("Body") ?? "").trim().slice(0, 1500);
  if (!to.startsWith("whatsapp:") || !from.startsWith("whatsapp:")) return reject(400);
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return new Response("Configuração incompleta", { status: 503 });
  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: channel, error: channelError } = await db.from("whatsapp_canais")
    .select("empresa_id,empresas!inner(status)").eq("numero_destino", to).eq("provedor", "twilio").eq("ativo", true).maybeSingle();
  if (channelError) { console.error("Falha ao localizar canal", channelError.code); return new Response("Erro interno", { status: 500 }); }
  if (!channel || (channel.empresas as { status?: string } | null)?.status !== "ativa")
    return reply("Este canal ainda não foi ativado para uma empresa.");
  const { data: sections, error } = await db.from("empresa_dados").select("secao,conteudo")
    .eq("empresa_id", channel.empresa_id).in("secao", ["produtos", "faqs", "horarios"]);
  if (error) { console.error("Falha ao consultar dados", error.code); return new Response("Erro interno", { status: 500 }); }
  const section = (name: string): unknown[] => {
    const content: unknown = sections?.find((s) => s.secao === name)?.conteudo;
    return Array.isArray(content) ? content : [];
  };
  return reply(answer(message, section("produtos") as Product[], section("faqs") as Faq[], section("horarios") as Hours[]));
});
