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
  ["encome", "pedido", "reserv", "antece", "sob", "personal", "solicit"],
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

// Intenções relacionadas compartilham contexto, mas não garantem o mesmo serviço.
const DETALHES_ENTREGA = /\\b(frete|taxa|valor|preco|custa|quanto|bairro|regiao|cidade|cep|prazo|tempo|demora|dias|horas|quando)\\b/;
const TERMOS_LOGISTICA = /\\b(entreg\\w*|delivery|frete|motoboy|domicilio|envi\\w*|levam|levar|mandam|mandar)\\b/;
const TERMOS_ENCOMENDA = /\\b(encomend\\w*|pedido\\w*|reserv\\w*|antecedencia)\\b/;

function encontrarFaqPorIntencao(texto: string, faqs: Faq[]): Faq | null {
  const t = norm(texto);
  const entrega = TERMOS_LOGISTICA.test(t);
  const detalhe = entrega && DETALHES_ENTREGA.test(t);
  const candidatas = faqs
    .filter((faq) => {
      const pergunta = norm(faq.pergunta);
      const resposta = norm(faq.resposta);
      if (entrega) {
        // Não usar "aceitamos encomendas" como confirmação de entrega ou frete.
        if (!TERMOS_LOGISTICA.test(pergunta) && !TERMOS_LOGISTICA.test(resposta)) return false;
        if (detalhe && !DETALHES_ENTREGA.test(pergunta + " " + resposta)) return false;
        return true;
      }
      if (TERMOS_ENCOMENDA.test(t)) return TERMOS_ENCOMENDA.test(pergunta);
      return INTENCOES.some((item) => item.padrao.test(t) && item.tipo === "pagamento" && item.busca.test(pergunta));
    });
  return candidatas[0] ?? null;
}

function respostaLogisticaSemCadastro(texto: string, faqs: Faq[]): string | null {
  const t = norm(texto);
  if (!TERMOS_LOGISTICA.test(t)) return null;
  const perguntaEspecifica = DETALHES_ENTREGA.test(t);
  const relacionadas = faqs.filter((f) => TERMOS_LOGISTICA.test(norm(f.pergunta) + " " + norm(f.resposta)));
  if (relacionadas.length) {
    return perguntaEspecifica
      ? "Ainda não tenho essa informação específica sobre entrega ou frete cadastrada. Vou pedir para a equipe confirmar. 🙋"
      : "Não tenho confirmação dessa modalidade de entrega no cadastro. Vou pedir para a equipe verificar. 🙋";
  }
  const encomenda = faqs.some((f) => TERMOS_ENCOMENDA.test(norm(f.pergunta)));
  return encomenda
    ? "Temos informações sobre encomendas, mas não há confirmação de entrega ou frete no cadastro. Vou pedir para a equipe verificar. 🙋"
    : "Ainda não tenho informações sobre entregas ou frete cadastradas. Vou pedir para a equipe confirmar. 🙋";
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

// Flexões conhecidas de tratamento: não altera palavras de produtos nem frases inteiras.
function normalizarVocativos(texto: string): string {
  const formas: Record<string, string> = {
    amiguinho: "amigo", amigao: "amigo", amiguinha: "amiga", amigona: "amiga",
    chefinho: "chefe", chefao: "chefe", chefona: "chefe",
    parceirinho: "parceiro", parceirao: "parceiro", parceirinha: "parceira", parceirona: "parceira",
    irmaozinho: "irmao", irmaozinha: "irma", irmaozona: "irma",
    carinha: "cara", carao: "cara", carazao: "cara",
    maninho: "mano", maninha: "mana", manzao: "mano",
    coleguinha: "colega", colegao: "colega", colegona: "colega",
    chapinha: "chapa", chapao: "chapa",
    reizinho: "rei", reizao: "rei", rainhazinha: "rainha",
    queridinho: "querido", queridinha: "querida", queridao: "querido",
    patrãozinho: "patrao", patraozinho: "patrao", patroazinha: "patroa",
    campeaozinho: "campeao", campeazinha: "campea",
    mamaezinha: "mamae", papaizinho: "papai",
  };
  return texto.split(" ").map((palavra) => formas[palavra] || palavra).join(" ");
}

function saudacao(texto: string, ctx: { instrucoes: Instrucoes; nomeEmpresa?: string }): string | null {
  const t = normalizarVocativos(normalizarCumprimento(texto));
  const resposta = () => "Olá, tudo bem? 😊 " + (ctx.nomeEmpresa?.trim() ? "Aqui é da " + ctx.nomeEmpresa.trim() + ". " : "") + "Como posso te ajudar?";

  // A frase pode conter uma saudação, vocativo e pergunta social, em qualquer combinação.
  const prefixos = ["bom dia", "boa tarde", "boa noite", "e ai", "fala ai", "oi", "ola", "opa", "alo", "hey", "salve", "fala", "tudo bem", "tudo bom"];
  const sociais = [
    "tudo bem", "tudo bom", "tudo certo", "tudo certinho", "tudo tranquilo",
    "tudo na paz", "como vai", "como voce esta", "ta bem", "ta tudo bem",
    "suave", "de boa", "na paz", "tranquilo", "tranquila", "beleza", "blz",
    "firmeza", "tudo firme", "como ta", "como c ta",
  ];
  const vocativos = new Set([
    "meu", "minha", "seu", "sua", "mano", "mana", "cara", "xara", "amigo",
    "amiga", "colega", "chapa", "irmao", "irma", "parceiro", "parceira",
    "chefe", "rei", "rainha", "mamae", "papai", "patrao", "patroa",
    "campeao", "campea", "querido", "querida", "mestre", "jovem", "pessoal",
    "gente", "bro", "brother", "parca", "parceira", "meu querido",
  ]);
  const nomeAtendente = normalizarCumprimento(ctx.instrucoes.nomeAtendente || "").split(" ")[0] || "";
  const nomeAlongado = nomeAtendente.length >= 2
    ? new RegExp("^" + [...nomeAtendente].filter((letra) => /[a-z]/.test(letra)).map((letra) => letra + "+").join("") + "$")
    : null;
  const removerInicio = (frase: string, expressoes: string[]): string => {
    const encontrada = [...expressoes].sort((a, b) => b.length - a.length).find((p) => frase === p || frase.startsWith(p + " "));
    return encontrada ? frase.slice(encontrada.length).trim() : frase;
  };
  const temSaudacao = prefixos.some((p) => t === p || t.startsWith(p + " "));
  if (temSaudacao) {
    let resto = removerInicio(t, prefixos);
    // Remove apenas vocativos conhecidos; se houver pedido real, ele permanece.
    for (let i = 0; i < 8 && resto; i++) {
      const palavra = resto.split(" ")[0];
      if (vocativos.has(palavra) || (nomeAlongado && nomeAlongado.test(palavra))) {
        resto = resto.slice(palavra.length).trim();
      } else break;
    }
    if (!resto || sociais.includes(resto)) return resposta();
  }
  if (sociais.includes(t)) return resposta();

  // Confirmações isoladas não devem chamar atendente.
  if (/^(?:ok|okay|okey|okie|okk|blz|beleza|entendi|entendido|certo|certinho|ta bom|show|fechou|combinado|perfeito|tranquilo|suave|demorou|pode crer|saquei|tendi|joia|massa|top|sim|aham|uhum|hum|hmm|ta|esta bem|de boa)(?:\s+(?:obrigado|obrigada|valeu|entao|beleza|show|mano|cara|amigo|amiga))*$/.test(t)) {
    return "Perfeito! 😊 Se precisar de mais alguma coisa, estou à disposição.";
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
const RESPOSTA_PRODUTO_AUSENTE = "Não achei esse produto cadastrado aqui nos produtos. Vou chamar alguém para verificar a disponibilidade.";

function respostaProdutoNaoCadastrado(texto: string): string | null {
  const t = norm(texto);
  // Intenção de consultar um item específico, independente do segmento da empresa.
  const consulta = /\b(?:tem|teria|teriam|vende|vendem|voces vendem|trabalham com|oferecem|possui|possuem|disponivel|estoque|preco de|preco do|preco da|quanto custa|queria comprar|gostaria de comprar)\b/.test(t);
  if (!consulta) return null;
  // Perguntas administrativas não são consultas de produto.
  if (/\b(?:horario|horarios|aberto|abrem|abre|fecha|fecham|domingo|sabado|segunda|terca|quarta|quinta|sexta|entrega|delivery|endereco|localizacao|pix|cartao|pagamento|agendamento|atendimento|telefone|contato)\b/.test(t)) return null;
  // Não interpretar "tem?" sozinho como consulta a um produto.
  const item = t.replace(/^(?:oi|ola|e ai|opa|bom dia|boa tarde|boa noite)\s+/, "")
    .replace(/^(?:voces?\s+)?(?:tem|teria|teriam|vende|vendem|trabalham com|oferecem|possui|possuem)\s+/, "")
    .replace(/^(?:um|uma|uns|umas|o|a|os|as)\s+/, "").trim();
  if (item.length < 3 || /^(?:algo|alguma coisa|produto|produtos|servico|servicos|isso|disponivel)$/.test(item)) return null;
  return RESPOSTA_PRODUTO_AUSENTE;
}

// Identifica pedidos claramente fora do ramo sem inventar disponibilidade.
const ATIVIDADES_FORA_DO_RAMO = [
  { ramo: 1, pergunta: /\b(barbearia|barbeiro|cabeleireiro|cabeleireira|cortam?\s+(?:o\s+)?cabelo|corte\s+de\s+cabelo|cortar\s+cabelo|fazem?\s+(?:a\s+)?barba|servicos?\s+de\s+barba|degrade)\b/, resposta: "não oferecemos serviços de barbearia ou corte de cabelo" },
  { ramo: 4, pergunta: /\b(furadeiras?|martelos?|parafusadeiras?|ferramentas?|material\s+de\s+construcao)\b/, resposta: "não trabalhamos com ferramentas" },
  { ramo: 2, pergunta: /\b(roupas?|camisetas?|calcas?|vestidos?|vestuario)\b/, resposta: "não trabalhamos com roupas" },
  { ramo: 5, pergunta: /\b(espelhos?|sofas?|armarios?|moveis?|decoracao)\b/, resposta: "não trabalhamos com móveis ou decoração" },
  { ramo: 3, pergunta: /\b(racao|coleiras?|banho\s+e\s+tosa|pet\s*shop)\b/, resposta: "não trabalhamos com produtos ou serviços pet" },
  { ramo: 0, pergunta: /\b(paes?|bolos?|salgados?|padaria)\b/, resposta: "não trabalhamos com produtos de padaria" },
];
function respostaForaDoRamo(texto: string, ctx: { empresas?: { nome: string; segmento?: string }[]; produtos: Produto[]; faqs: Faq[] }): string | null {
  const empresa = ctx.empresas?.[0];
  if (!empresa) return null;
  const ramo = RAMOS.findIndex((r) => r.re.test(norm((empresa.segmento || "") + " " + empresa.nome)));
  if (ramo < 0) return null;
  const t = norm(texto);
  const atividade = ATIVIDADES_FORA_DO_RAMO.find((a) => a.ramo !== ramo && a.pergunta.test(t));
  if (!atividade) return null;
  // Um cadastro explícito da empresa tem prioridade sobre suposições pelo segmento.
  if (ctx.produtos.some((p) => norm(p.nome).split(/[\s(]/).some((w) => w.length > 3 && t.includes(w)))) return null;
  if (ctx.faqs.some((f) => norm(f.pergunta) === t)) return null;
  return "Não, aqui " + atividade.resposta + ". 😊 Somos " + empresa.nome + ", " + RAMOS[ramo].descricao + ". Você gostaria de saber algo sobre nossos produtos ou serviços?";
}

// Perguntas de acompanhamento sobre o último produto mencionado pelo bot.
function respostaProdutoPorIntencao(texto: string, produto: Produto): string {
  const t = norm(texto);
  const nome = produto.nome;
  const preco = brl(produto.preco);
  const temDescricao = Boolean(produto.descricao?.trim());
  if (/\b(preco|valor|custa|custam|quanto|sai por|quanto ta)\b/.test(t)) {
    return "A " + nome + " custa " + preco + ". 😊" + (temDescricao ? " Quer saber mais detalhes?" : "");
  }
  if (/\b(descricao|descreve|detalhes|caracteristicas|informacoes|como e|do que e feito|composicao)\b/.test(t)) {
    return produto.descricao?.trim()
      ? "Claro! 😊 Sobre " + nome + ": " + produto.descricao
      : "A " + nome + " está cadastrada, mas ainda não tenho uma descrição detalhada. Posso pedir que a equipe confirme.";
  }
  const especie = /\b(gato|gata|gatos|gatas|felino|felinos)\b/.test(t) ? "gatos"
    : /\b(filhote|filhotes)\b/.test(t) ? "filhotes"
    : /\b(cao|caes|cachorro|cachorra|cachorros|canino|caninos)\b/.test(t) ? "cães" : null;
  if (especie && /\b(serve|indicado|indicada|compativel|pode dar|pode usar|funciona|ideal|apropriado|e pra|para)\b/.test(t)) {
    const descricao = norm(produto.descricao + " " + produto.categoria + " " + produto.nome);
    const confirma = especie === "gatos" ? /\b(gato|gata|gatos|gatas|felino|felinos)\b/.test(descricao)
      : especie === "filhotes" ? /\b(filhote|filhotes)\b/.test(descricao)
      : /\b(cao|caes|cachorro|cachorros|canino|caninos)\b/.test(descricao);
    return confirma
      ? "Segundo o cadastro, " + nome + " é indicado para " + especie + ". 🐾 Confira também a embalagem."
      : "Não tenho confirmação no cadastro de que " + nome + " seja indicado para " + especie + ". Vou chamar alguém da equipe para verificar.";
  }
  if (/\b(tem|teria|vendem|vende|disponivel|estoque|possui|possuem|trabalham com)\b/.test(t)) {
    return "Temos sim! 😊 " + nome + " está no nosso catálogo por " + preco + "." + (temDescricao ? " Quer mais detalhes?" : "");
  }
  return "Encontrei " + nome + " no catálogo por " + preco + ". 😊" + (temDescricao ? " Quer saber mais detalhes?" : "");
}

function responderSobreUltimoProduto(texto: string, historico: string[], produtos: Produto[]): string | null {
  const t = norm(texto);
  const acompanhamento = /\b(ela|ele|esse|essa|isso|dela|dele|desse|dessa|serve|indicado|indicada|compativel|pode dar|pode usar|funciona|ideal|apropriado|descricao|detalhes|caracteristicas|preco|custa|quanto)\b/.test(t);
  if (!acompanhamento || !historico.length) return null;
  const ultimaResposta = [...historico].reverse().find((mensagem) =>
    produtos.some((produto) => norm(mensagem).includes(norm(produto.nome)))
  );
  if (!ultimaResposta) return null;
  const produto = produtos.find((p) => norm(ultimaResposta).includes(norm(p.nome)));
  if (!produto) return null;
  // Só usa o contexto se a mensagem atual não mencionar explicitamente outro produto.
  const outro = produtos.some((p) => p.id !== produto.id && norm(t).includes(norm(p.nome)));
  if (outro) return null;
  return respostaProdutoPorIntencao(texto, produto);
}

function responderBase(
  texto: string,
  ctx: { produtos: Produto[]; faqs: Faq[]; horarios: Horario[]; instrucoes: Instrucoes; empresas?: { nome: string; segmento?: string }[] },
  historico: string[] = [],
): string {
  const conversa = inferirContexto(texto, historico);
  const t = norm(conversa);

  // "Sim" em resposta à oferta de detalhes deve continuar o assunto anterior.
  if (/^(?:sim|quero|claro|pode|por favor|quero sim|sim por favor|manda|pode mandar)$/.test(norm(texto))) {
    const ultima = [...historico].reverse().find((m) => /quer (?:saber )?mais detalhes\??/i.test(m));
    if (ultima) {
      const produtoAnterior = ctx.produtos.find((p) => norm(ultima).includes(norm(p.nome)));
      if (produtoAnterior) {
        return produtoAnterior.descricao?.trim()
          ? "Claro! 😊 Sobre " + produtoAnterior.nome + ": " + produtoAnterior.descricao
          : "Ainda não tenho uma descrição cadastrada para " + produtoAnterior.nome + ".";
      }
    }
  }

  const cumprimento = saudacao(texto, { instrucoes: ctx.instrucoes, nomeEmpresa: ctx.empresas?.[0]?.nome });
  if (cumprimento) return cumprimento;

  const acompanhamento = responderSobreUltimoProduto(texto, historico, ctx.produtos);
  if (acompanhamento) return acompanhamento;

  const foraDoRamo = respostaForaDoRamo(conversa, ctx);
  if (foraDoRamo) return foraDoRamo;

  const perguntaLogistica = TERMOS_LOGISTICA.test(t);\n  const faq = encontrarFaqPorIntencao(conversa, ctx.faqs) ?? (perguntaLogistica ? null : encontrarFaq(conversa, ctx.faqs));
  if (faq) return normalizarTextoResposta(faq.resposta);\n\n  const logistica = respostaLogisticaSemCadastro(conversa, ctx.faqs);\n  if (logistica) return logistica;

  const horario = responderHorario(conversa, ctx.horarios);
  if (horario) return horario;

  const prod = ctx.produtos.find((p) => norm(p.nome).split(/[\s(]/).some((w) => w.length > 3 && t.includes(w)));
  if (prod) return respostaProdutoPorIntencao(texto, prod);

  const naoCadastrado = respostaProdutoNaoCadastrado(conversa);
  if (naoCadastrado) return naoCadastrado;

  if (/\b(cardapio|produtos?|precos?|menu|servicos?)\b/.test(t) && !/\b(se|voces|vcs|tem|oferecem|fazem|vendem)\b/.test(t)) {
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
