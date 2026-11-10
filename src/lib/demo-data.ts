import type { Empresa, Produto, Horario, Faq, Instrucoes } from "./types";

export const empresasDemo: Empresa[] = [
  { id: "e1", nome: "Padaria Pão Dourado", segmento: "Alimentação", telefone: "(11) 98765-4321", cidade: "São Paulo - SP", ativa: true },
  { id: "e2", nome: "Moda Bella", segmento: "Vestuário", telefone: "(21) 99876-1122", cidade: "Rio de Janeiro - RJ", ativa: true },
  { id: "e3", nome: "PetShop Amigo Fiel", segmento: "Pet", telefone: "(31) 97654-3344", cidade: "Belo Horizonte - MG", ativa: false },
];
export const produtosDemo: Produto[] = [
  { id: "p1", nome: "Pão francês (kg)", preco: 16.9, descricao: "Pão fresquinho, assado a cada 2 horas.", categoria: "Pães" },
  { id: "p2", nome: "Bolo de cenoura", preco: 32, descricao: "Com cobertura de chocolate, serve 10 pessoas.", categoria: "Bolos" },
  { id: "p3", nome: "Café expresso", preco: 6.5, descricao: "Grãos selecionados, 50ml.", categoria: "Bebidas" },
  { id: "p4", nome: "Coxinha", preco: 8, descricao: "Frango com catupiry, massa crocante.", categoria: "Salgados" },
];
export const horariosDemo: Horario[] = [
  ["Segunda-feira", true], ["Terça-feira", true], ["Quarta-feira", true], ["Quinta-feira", true],
  ["Sexta-feira", true], ["Sábado", true], ["Domingo", false],
].map(([dia, aberto]) => ({ dia: dia as string, aberto: aberto as boolean, abre: "07:00", fecha: dia === "Sábado" ? "13:00" : "19:00" }));
export const faqsDemo: Faq[] = [
  { id: "f1", pergunta: "Vocês fazem entrega?", resposta: "Sim! Entregamos em até 5 km, com taxa de R$ 5,00." },
  { id: "f2", pergunta: "Quais formas de pagamento?", resposta: "Aceitamos Pix, cartão de crédito, débito e dinheiro." },
  { id: "f3", pergunta: "Aceitam encomendas?", resposta: "Sim, encomendas de bolos com 48 horas de antecedência." },
];
export const instrucoesDemo: Instrucoes = {
  nomeAtendente: "Duda",
  tom: "amigavel",
  boasVindas: "Olá! Eu sou a Duda, atendente virtual da Padaria Pão Dourado. Como posso ajudar? 😊",
  regras: "Seja sempre educada. Não invente preços. Se não souber a resposta, ofereça falar com um atendente humano.",
  transferirHumano: true,
};
export const resumoDemo = { conversasHoje: 128, resolvidasIA: 87, tempoMedio: "12s", satisfacao: 4.8,
  semana: [42, 65, 58, 80, 96, 110, 128],
  recentes: [
    { nome: "Mariana S.", msg: "Qual o preço do bolo de cenoura?", hora: "17:42", status: "Resolvida" },
    { nome: "Carlos P.", msg: "Vocês abrem domingo?", hora: "17:30", status: "Resolvida" },
    { nome: "Juliana R.", msg: "Quero fazer uma encomenda grande", hora: "17:12", status: "Humano" },
    { nome: "Roberto L.", msg: "Fazem entrega no centro?", hora: "16:58", status: "Resolvida" },
  ] };
