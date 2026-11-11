// Motor de respostas simulado (regras simples).
// Prioridade: 1) Perguntas frequentes  2) saudação  3) produtos  4) horários.
// Futuro: trocar por chamada à IA no servidor, recebendo as mesmas entradas.
import type { Faq, Horario, Instrucoes, Produto } from "./types";
import { brl } from "./store";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const STOP = new Set("o a os as um uma uns umas de do da dos das no na nos nas em para pra pro por com e ou que qual quais quanto quantos quando como voces voce vcs vc tem ter ha eu me minha meu seu sua sobre se sim nao isso esse essa ai la ja so tambem mais muito oi ola gostaria queria saber pode podem posso favor obrigado".split(" "));

// Grupos de sinônimos: palavras do mesmo grupo viram o mesmo conceito.
const SINONIMOS: string[][] = [
  ["entreg", "deliver", "levam", "levar", "mandam", "mandar", "envia", "envio", "frete", "casa", "domicil", "motob", "taxa"],
  ["pagam", "pagar", "pago", "pix", "cartao", "credit", "debit", "dinhei", "forma", "aceit"],
  ["encome", "pedido", "reserv", "antece", "sob", "personal"],
  ["horar", "abre", "abert", "fecha", "funcio", "expedi", "hora"],
  ["preco", "custa", "valor", "quant", "cobra"],
  ["ender", "local", "onde", "fica", "rua", "endereco"],
];
const conceito = (w: string) => {
  for (const [i, g] of SINONIMOS.entries()) if (g.some((r) => w.startsWith(r) || (w.length >= 4 && r.startsWith(w)))) return `#${i}`;
  return w.length > 5 ? w.slice(0, 5) : w;
};
const termos = (s: string) => new Set(norm(s).split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w)).map(conceito));

export function encontrarFaq(texto: string, faqs: Faq[]): Faq | null {
  const t = termos(texto);
  if (!t.size) return null;
  let melhor: Faq | null = null, nota = 0;
  for (const f of faqs) {
    const q = termos(f.pergunta);
    if (!q.size) continue;
    const comuns = [...q].filter((w) => t.has(w)).length;
    const n = comuns / q.size + comuns * 0.01;
    if (comuns > 0 && comuns / q.size >= 0.5 && n > nota) { nota = n; melhor = f; }
  }
  return melhor;
}

export function responder(texto: string, ctx: { produtos: Produto[]; faqs: Faq[]; horarios: Horario[]; instrucoes: Instrucoes }): string {
  const t = norm(texto);
  const faq = encontrarFaq(texto, ctx.faqs);
  if (faq) return faq.resposta;
  if (/^(oi|ola|bom dia|boa tarde|boa noite)/.test(t)) return ctx.instrucoes.boasVindas;
  const prod = ctx.produtos.find((p) => norm(p.nome).split(/[\s(]/).some((w) => w.length > 3 && t.includes(w)));
  if (prod) return `O ${prod.nome} custa ${brl(prod.preco)}. ${prod.descricao}`;
  if (/(cardapio|produtos|preco|precos|menu)/.test(t))
    return "Nossos produtos:\n" + ctx.produtos.map((p) => `• ${p.nome} — ${brl(p.preco)}`).join("\n");
  if (/(horario|abre|fecha|funciona|aberto|domingo|sabado)/.test(t))
    return "Nosso horário:\n" + ctx.horarios.map((h) => `• ${h.dia}: ${h.aberto ? `${h.abre} às ${h.fecha}` : "Fechado"}`).join("\n");
  return ctx.instrucoes.transferirHumano
    ? "Não tenho essa informação agora. Vou chamar um atendente humano para te ajudar! 🙋"
    : "Desculpe, não entendi. Pode reformular a pergunta?";
}
