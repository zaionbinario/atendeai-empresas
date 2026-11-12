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

function formatarFaixaDeDias(inicio: string, fim: string): string {
  if (inicio === fim) return inicio;
  const primeiro = inicio.replace("-feira", "");
  const sufixo = fim.endsWith("-feira") ? "-feira" : "";
  const ultimo = fim.replace("-feira", "").toLowerCase();
  return `${primeiro} a ${ultimo}${sufixo}`;
}

function formatarHorarios(horarios: Horario[]): string {
  const linhas: string[] = [];
  let i = 0;

  while (i < horarios.length) {
    const atual = horarios[i]!;
    let fim = i;

    while (fim + 1 < horarios.length) {
      const proximo = horarios[fim + 1]!;
      if (
        proximo.aberto !== atual.aberto ||
        (atual.aberto && (proximo.abre !== atual.abre || proximo.fecha !== atual.fecha))
      ) break;
      fim++;
    }

    const dia = formatarFaixaDeDias(atual.dia, horarios[fim]!.dia);
    const expediente = atual.aberto ? `${atual.abre} às ${atual.fecha}` : "Fechado";
    linhas.push(`• ${dia}: ${expediente}`);
    i = fim + 1;
  }

  return linhas.join("\n");
}

function responderHorario(texto: string, horarios: Horario[]): string | null {
  const t = norm(texto);
  const perguntaHorario = /(horario|abre|abrem|aberto|aberta|fecha|fecham|funciona|funcionam|funcionamento)/.test(t);
  if (!perguntaHorario) return null;

  const dia = DIAS.find((d) => d.aliases.some((alias) => new RegExp(`(^|\\s)${alias}($|\\s)`).test(t)));
  if (dia) {
    const horario = horarios.find((h) => norm(h.dia) === norm(dia.dia));
    if (!horario) return `Ainda não tenho o horário de ${dia.dia.toLowerCase()} cadastrado. Vou pedir para a equipe confirmar essa informação. 🙋`;
    if (!horario.aberto) return `Não abrimos ${dia.dia.toLowerCase()}. Nosso estabelecimento fica fechado nesse dia. 😊`;
    return `Sim! Abrimos ${dia.dia.toLowerCase()}, das ${horario.abre} às ${horario.fecha}. 😊`;
  }

  const perguntaGeral = /(horario|funcionamento|funcionam|abrem|abre|expediente)/.test(t);
  if (perguntaGeral) {
    return `Claro! 😊 Nosso horário de funcionamento é:\n\n${formatarHorarios(horarios)}\n\nSe precisar de mais alguma informação, estou à disposição! 😊`;
  }
  return null;
}

type Intencao = "pagamento" | "entrega" | "encomenda";

const INTENCOES: { tipo: Intencao; padrao: RegExp; busca: RegExp }[] = [
  { tipo: "pagamento", padrao: /\b(debit|debito|credito|cartao|pix|dinheiro|pagamento|pagar|pagam|passam|maquininha)\w*\b/, busca: /\b(pagamento|pagar|pagam|pix|cartao|credito|debito|dinheiro|aceitam|formas)\w*\b/ },
  { tipo: "entrega", padrao: /\b(entrega|entregam|entregar|delivery|motoboy|frete|domicilio)\w*\b/, busca: /\b(entrega|entregam|delivery|frete|motoboy)\w*\b/ },
  { tipo: "encomenda", padrao: /\b(encomenda|encomendas|reservar|reserva|antecedencia|pedido)\w*\b/, busca: /\b(encomenda|reserva|pedido|antecedencia)\w*\b/ },
];

function encontrarFaqPorIntencao(texto: string, faqs: Faq[]): Faq | null {
  const t = norm(texto);
  const intencao = INTENCOES.find((item) => item.padrao.test(t));
  if (!intencao) return null;
  return faqs.find((faq) => intencao.busca.test(norm(faq.pergunta)) || intencao.busca.test(norm(faq.resposta))) ?? null;
}

function normalizarTextoResposta(texto: string): string {
  return texto.split("\\r\\n").join("\n").split("\\n").join("\n").split("\\t").join(" ").trim();
}

// Reconhece letras prolongadas em cumprimentos, sem confundir perguntas com saudações.
function normalizarCumprimento(texto: string): string {
  return norm(texto)
    .replace(/([a-z])\1{2,}/g, "$1")
    .replace(/\be\s*a+i+\b/g, "e ai")
    .replace(/\beae+\b/g, "e ai")
    .replace(/\bo+i+\b/g, "oi")
    .replace(/\bo+la+\b/g, "ola")
    .replace(/\bo+pa+\b/g, "opa")
    .replace(/\bbo+m\b/g, "bom")
    .replace(/\bdi+a+\b/g, "dia")
    .replace(/\bta+rde+\b/g, "tarde")
    .replace(/\bno+i+te+\b/g, "noite")
    .replace(/\btu+do+\b/g, "tudo")
    .replace(/\bbe+m+\b/g, "bem")
    .replace(/\s+/g, " ")
    .trim();
}

function saudacao(texto: string, ctx: { instrucoes: Instrucoes; nomeEmpresa?: string }): string | null {
  const t = normalizarCumprimento(texto);
  const parte = "(?:oi|ola|e ai|opa|alo|hey|bom dia|boa tarde|boa noite|tudo bem|tudo bom|como vai|como voce esta|blz|beleza|salve|fala|fala ai)";
  const somenteCumprimento = new RegExp("^(?:" + parte + ")(?:\\s+(?:" + parte + "))*$").test(t);
  if (somenteCumprimento) {
    const nome = ctx.nomeEmpresa?.trim();
    const apresentacao = nome ? `Aqui é da ${nome}.` : "Seja bem-vindo(a)!";
    return `Olá, tudo bem? 😊 ${apresentacao} Como posso te ajudar?`;
  }
  if (/^(obrigado|obrigada|valeu|agradeco)( |$)/.test(t)) return "Por nada! 😊 Se precisar de mais alguma coisa, é só chamar.";
  if (/^(tchau|ate mais|ate logo)( |$)/.test(t)) return "Até mais! Foi um prazer ajudar. 😊";
  return null;
}

function inferirContexto(texto: string, historico: string[]): string {
  const t = norm(texto);
  const curto = t.split(" ").length <= 6;
  if (!curto || !historico.length) return texto;
  const anterior = norm(historico.slice(-6).join(" "));
  if (/(horario|abre|abrem|aberto|fecha|funciona|funcionamento)/.test(anterior) && /(sabado|domingo|segunda|terca|quarta|quinta|sexta|hoje|amanha)/.test(t)) return `horario ${texto}`;
  if (/(preco|custa|valor|produto|cardapio)/.test(anterior) && /(quanto|esse|essa|ele|ela|qual|e o|e a)/.test(t)) return `preço ${texto}`;
  if (/(entrega|delivery)/.test(anterior) && /(bairro|aqui|la|regiao|taxa|prazo)/.test(t)) return `entrega ${texto}`;
  return texto;
}

const RAMOS = [
  { re: /padaria|panific|aliment|confeit|cafeteria/, descricao: "uma padaria ou negócio de alimentação" },
  { re: /barbearia|barbeiro|salao|beleza/, descricao: "uma barbearia ou salão de beleza" },
  { re: /roupa|moda|vestuario|boutique/, descricao: "uma loja de roupas" },
  { re: /pet|veterin|animal/, descricao: "um estabelecimento para animais" },
  { re: /ferrament|ferragem|construc/, descricao: "uma loja de ferramentas e materiais" },
  { re: /moveis|decoracao/, descricao: "uma loja de móveis e decoração" },
];
const ITENS = [
  { re: /\b(furadeira|martelo|parafusadeira|ferramentas?)\b/, ramo: 4 },
  { re: /\b(espelho|sofa|armario|moveis?)\b/, ramo: 5 },
  { re: /\b(roupas?|camisetas?|calcas?|vestidos?)\b/, ramo: 2 },
  { re: /\b(pao|paes|bolo|coxinha|salgados?)\b/, ramo: 0 },
  { re: /\b(corte de cabelo|barba|degrade)\b/, ramo: 1 },
  { re: /\b(racao|coleira|banho e tosa)\b/, ramo: 3 },
];
function respostaProdutoNaoCadastrado(texto: string, empresas?: { nome: string; segmento?: string }[]): string | null {
  const t = norm(texto);
  if (!/\b(vende|vendem|tem|teria|trabalha|trabalham|oferece|oferecem|comprar|preco|valor|custa|quanto)\b/.test(t)) return null;
  const item = ITENS.find((i) => i.re.test(t));
  if (!item) return null;
  const empresa = empresas?.[0];
  const nome = empresa?.nome || "Nosso estabelecimento";
  const ramo = RAMOS.findIndex((r) => r.re.test(norm((empresa?.segmento || "") + " " + nome)));
  if (ramo >= 0 && ramo !== item.ramo) return "Aqui é " + nome + ", " + RAMOS[ramo].descricao + ". 😊 Esse tipo de produto não está cadastrado aqui. Posso chamar alguém da equipe para confirmar se trabalhamos com ele.";
  return "Aqui é " + nome + "! 😊 Não encontrei esse item entre os produtos ou serviços cadastrados. Posso chamar alguém da equipe para confirmar a disponibilidade.";
}

function responderBase(
  texto: string,
  ctx: { produtos: Produto[]; faqs: Faq[]; horarios: Horario[]; instrucoes: Instrucoes; empresas?: { nome: string; segmento?: string }[] },
  historico: string[] = [],
): string {
  const conversa = inferirContexto(texto, historico);
  const t = norm(conversa);

  const cumprimento = saudacao(texto, { instrucoes: ctx.instrucoes, nomeEmpresa: ctx.empresas?.[0]?.nome });
  if (cumprimento) return cumprimento;

  const faq = encontrarFaqPorIntencao(conversa, ctx.faqs) ?? encontrarFaq(conversa, ctx.faqs);
  if (faq) return normalizarTextoResposta(faq.resposta);

  const horario = responderHorario(conversa, ctx.horarios);
  if (horario) return horario;

  const prod = ctx.produtos.find((p) => norm(p.nome).split(/[\s(]/).some((w) => w.length > 3 && t.includes(w)));
  if (prod) return `${prod.nome}: ${brl(prod.preco)}. ${prod.descricao}`;

  const naoCadastrado = respostaProdutoNaoCadastrado(conversa, ctx.empresas);
  if (naoCadastrado) return naoCadastrado;

  if (/(cardapio|produtos|preco|precos|menu|servicos|servico)/.test(t)) {
    if (!ctx.produtos.length) {
      const empresa = ctx.empresas?.[0];
      const ramo = RAMOS.find((r) => r.re.test(norm((empresa?.segmento || "") + " " + (empresa?.nome || ""))));
      return (empresa?.nome || "Nossa empresa") + " é " + (ramo?.descricao || "um estabelecimento comercial") + ". 😊 Ainda não temos produtos ou serviços cadastrados para informar com segurança. Posso chamar alguém da equipe.";
    }
    const lista = ctx.produtos.map((p) => `• ${p.nome} — ${brl(p.preco)}`).join("\n");
    return `Claro! Aqui estão algumas opções:\n${lista}\n\nQuer saber mais sobre algum deles?`;
  }

  if (/(endereco|onde fica|localizacao|local)/.test(t)) {
    return "Não tenho o endereço cadastrado nesta conversa. Para não te passar uma informação errada, posso chamar alguém da equipe para confirmar. 🙋";
  }
  if (/(agendar|agendamento|marcar horario|consulta)/.test(t)) {
    return "Claro! 😊 Qual dia e horário você prefere? Se quiser, também posso chamar a equipe para confirmar a disponibilidade.";
  }

  return ctx.instrucoes.transferirHumano
    ? "Não encontrei essa informação por aqui e prefiro não te passar algo errado. Vou chamar alguém da equipe para te ajudar. 🙋"
    : "Não encontrei essa informação por aqui. Você pode me explicar de outro jeito?";
}

export function responder(
  texto: string,
  ctx: { produtos: Produto[]; faqs: Faq[]; horarios: Horario[]; instrucoes: Instrucoes; empresas?: { nome: string; segmento?: string }[] },
  historico: string[] = [],
): string {
  let resposta = responderBase(texto, ctx, historico);
  if (ctx.instrucoes.tom === "formal") {
    resposta = resposta.replace(/ 😊| 🙋/g, "").replace("Claro!", "Certamente,").replace("Sim!", "Sim,").replace("Tudo ótimo por aqui!", "Estou bem, obrigado(a).");
  } else if (ctx.instrucoes.tom === "descontraido") {
    resposta = resposta.replace("Claro!", "Opa!").replace("Sim!", "Siiim!").replace("Não abrimos", "Poxa, não abrimos");
  }
  return resposta;
}
