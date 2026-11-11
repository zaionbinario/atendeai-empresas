// Motor de respostas demonstrativo.
// Prioridade: FAQ cadastrada, saudação, intenção de horário, produtos e fallback.
// A resposta de horário é contextual: não despeja a semana inteira quando o cliente pergunta por um dia.
import type { Faq, Horario, Instrucoes, Produto } from "./types";
import { brl } from "./store";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[!?.,;:]/g, " ").replace(/\s+/g, " ").trim();

const STOP = new Set("o a os as um uma uns umas de do da dos das no na nos nas em para pra pro por com e ou que qual quais quanto quantos quando como voces voce vcs vc tem ter ha eu me minha meu seu sua sobre se sim nao isso esse essa ai la ja so tambem mais muito oi ola gostaria queria saber pode podem posso favor obrigado".split(" "));

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

const DIAS: { dia: string; aliases: string[] }[] = [
  { dia: "Segunda-feira", aliases: ["segunda", "segundas"] },
  { dia: "Terça-feira", aliases: ["terca", "tercas"] },
  { dia: "Quarta-feira", aliases: ["quarta", "quartas"] },
  { dia: "Quinta-feira", aliases: ["quinta", "quintas"] },
  { dia: "Sexta-feira", aliases: ["sexta", "sextas"] },
  { dia: "Sábado", aliases: ["sabado", "sabados", "sab"] },
  { dia: "Domingo", aliases: ["domingo", "domingos", "dom"] },
];

function responderHorario(texto: string, horarios: Horario[]): string | null {
  const t = norm(texto);
  const perguntaHorario = /(horario|abre|abrem|aberto|aberta|fecha|fecham|funciona|funcionam|funcionamento)/.test(t);
  if (!perguntaHorario) return null;

  const dia = DIAS.find((d) => d.aliases.some((alias) => new RegExp(`(^|\\\\s)${alias}($|\\\\s)`).test(t)));
  if (dia) {
    const horario = horarios.find((h) => norm(h.dia) === norm(dia.dia));
    if (!horario) return `Ainda não tenho o horário de ${dia.dia.toLowerCase()} cadastrado. Vou pedir para a equipe confirmar essa informação. 🙋`;
    if (!horario.aberto) return `Não abrimos ${dia.dia.toLowerCase()}. Nosso estabelecimento fica fechado nesse dia. 😊`;
    return `Sim! Abrimos ${dia.dia.toLowerCase()}, das ${horario.abre} às ${horario.fecha}. 😊`;
  }

  if (/(todos os dias|semana toda|durante a semana|horarios|horario de funcionamento)/.test(t)) {
    return "Estes são nossos horários de funcionamento:\\n" + horarios.map((h) => `• ${h.dia}: ${h.aberto ? `${h.abre} às ${h.fecha}` : "Fechado"}`).join("\\n");
  }
  return "Claro! Você quer saber o horário de qual dia da semana? 😊";
}

export function responder(texto: string, ctx: { produtos: Produto[]; faqs: Faq[]; horarios: Horario[]; instrucoes: Instrucoes }): string {
  const t = norm(texto);
  const faq = encontrarFaq(texto, ctx.faqs);
  if (faq) return faq.resposta;
  if (/^(oi|ola|bom dia|boa tarde|boa noite)/.test(t)) return ctx.instrucoes.boasVindas;

  const horario = responderHorario(texto, ctx.horarios);
  if (horario) return horario;

  const prod = ctx.produtos.find((p) => norm(p.nome).split(/[\\s(]/).some((w) => w.length > 3 && t.includes(w)));
  if (prod) return `O ${prod.nome} custa ${brl(prod.preco)}. ${prod.descricao}`;
  if (/(cardapio|produtos|preco|precos|menu)/.test(t))
    return "Nossos produtos:\\n" + ctx.produtos.map((p) => `• ${p.nome} — ${brl(p.preco)}`).join("\\n");

  return ctx.instrucoes.transferirHumano
    ? "Não tenho essa informação agora. Vou chamar um atendente humano para te ajudar! 🙋"
    : "Desculpe, não entendi. Pode reformular a pergunta?";
}
