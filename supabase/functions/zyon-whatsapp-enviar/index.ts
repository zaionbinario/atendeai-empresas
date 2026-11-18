// Supabase Edge Function: zyon-whatsapp-enviar
// Deploy only after setting EVOLUTION_API_URL (public HTTPS) and EVOLUTION_API_KEY.
// Never expose these secrets to the browser. Localhost Docker is not reachable from Supabase cloud.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
});

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ erro: "Método não permitido" }, 405);
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return json({ erro: "Autenticação necessária" }, 401);
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) return json({ erro: "Servidor não configurado" }, 503);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: identity, error: identityError } = await userClient.auth.getUser();
  if (identityError || !identity.user) return json({ erro: "Sessão inválida" }, 401);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ erro: "JSON inválido" }, 400); }
  const conversaId = body.conversa_id;
  const empresaId = body.empresa_id;
  const conteudo = typeof body.conteudo === "string" ? body.conteudo.trim() : "";
  if (typeof conversaId !== "string" || !/^[0-9a-f-]{36}$/i.test(conversaId) ||
      typeof empresaId !== "string" || !/^[0-9a-f-]{36}$/i.test(empresaId) ||
      !conteudo || conteudo.length > 4000) return json({ erro: "Mensagem ou conversa inválida" }, 400);

  // Service role is server-only. All company permissions must be explicitly checked.
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: membership, error: membershipError } = await admin.from("empresa_usuarios")
    .select("empresa_id").eq("empresa_id", empresaId).eq("usuario_id", identity.user.id).limit(1).maybeSingle();
  if (membershipError) return json({ erro: "Não foi possível verificar a permissão" }, 503);
  if (!membership) return json({ erro: "Sem acesso à empresa" }, 403);

  const { data: conversa, error: conversaError } = await admin.from("conversas")
    .select("id,empresa_id,instancia_id,contato_whatsapp").eq("id", conversaId)
    .eq("empresa_id", empresaId).maybeSingle();
  if (conversaError) return json({ erro: "Falha ao consultar conversa" }, 503);
  if (!conversa) return json({ erro: "Conversa não encontrada" }, 404);

  const { data: instancia, error: instanciaError } = await admin.from("whatsapp_instancias")
    .select("id,nome_instancia").eq("id", conversa.instancia_id)
    .eq("empresa_id", empresaId).maybeSingle();
  if (instanciaError || !instancia?.nome_instancia) return json({ erro: "Instância não disponível" }, 503);

  const base = Deno.env.get("EVOLUTION_API_URL") ?? "";
  const apiKey = Deno.env.get("EVOLUTION_API_KEY") ?? "";
  let endpoint: URL;
  try {
    endpoint = new URL(base);
    if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) throw Error();
  } catch { return json({ erro: "Envio indisponível: configure URL HTTPS da Evolution API" }, 503); }
  if (!apiKey) return json({ erro: "Envio indisponível: configure a chave da Evolution API" }, 503);

  // Fail closed: LID identifiers are not telephone numbers.
  const match = /^([0-9]{10,15})@s\.whatsapp\.net$/.exec(conversa.contato_whatsapp ?? "");
  if (!match) return json({ erro: "Contato sem número válido para envio; resolução de LID pendente" }, 422);
  const url = new URL("/message/sendText/" + encodeURIComponent(instancia.nome_instancia), endpoint);
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": apiKey },
      body: JSON.stringify({ number: match[1], text: conteudo }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return json({ erro: "Não foi possível confirmar o envio na Evolution API; confira antes de tentar novamente" }, 502);
  }
  if (!response.ok) return json({ erro: "Evolution API não confirmou o envio", status: response.status }, 502);
  // The Evolution webhook should persist outbound messages. Avoid a second insert here.
  return json({ sucesso: true });
});
