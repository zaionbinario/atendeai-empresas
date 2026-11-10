// Motor de respostas simulado (regras simples).
// Futuro: trocar por chamada à IA no servidor, recebendo as mesmas entradas.
import type { Faq, Horario, Instrucoes, Produto } from "./types";
import { brl } from "./store";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function responder(texto: string, ctx: { produtos: Produto[]; faqs: Faq[]; horarios: Horario[]; instrucoes: Instrucoes }): string {
  const t = norm(texto);
  if (/^(oi|ola|bom dia|boa tarde|boa noite)/.test(t)) return ctx.instrucoes.boasVindas;
  const prod = ctx.produtos.find((p) => norm(p.nome).split(/[\s(]/).some((w) => w.length > 3 && t.includes(w)));
  if (prod) return `O ${prod.nome} custa ${brl(prod.preco)}. ${prod.descricao}`;
  if (/(cardapio|produtos|preco|precos|menu)/.test(t))
    return "Nossos produtos:\n" + ctx.produtos.map((p) => `• ${p.nome} — ${brl(p.preco)}`).join("\n");
  if (/(horario|abre|fecha|funciona|aberto|domingo|sabado)/.test(t))
    return "Nosso horário:\n" + ctx.horarios.map((h) => `• ${h.dia}: ${h.aberto ? `${h.abre} às ${h.fecha}` : "Fechado"}`).join("\n");
  let melhor: Faq | null = null, pontos = 0;
  for (const f of ctx.faqs) {
    const p = norm(f.pergunta).split(/\W+/).filter((w) => w.length > 3 && t.includes(w.slice(0, 5))).length;
    if (p > pontos) { pontos = p; melhor = f; }
  }
  if (melhor) return melhor.resposta;
  return ctx.instrucoes.transferirHumano
    ? "Não tenho essa informação agora. Vou chamar um atendente humano para te ajudar! 🙋"
    : "Desculpe, não entendi. Pode reformular a pergunta?";
}
