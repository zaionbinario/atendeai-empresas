import { describe, it, expect } from "vitest";
import { responder } from "@/lib/simulador";
import * as d from "@/lib/demo-data";
const ctx = (faqs = d.faqsDemo) => ({ produtos: d.produtosDemo, faqs, horarios: d.horariosDemo, instrucoes: d.instrucoesDemo });
const entrega = d.faqsDemo[0]!.resposta;
describe("prioridade das Perguntas frequentes", () => {
  it("variações reconhecem a mesma pergunta", () => {
    for (const m of ["Vocês fazem entrega?", "vcs entregam em casa?", "Tem delivery?", "fazem entregas no meu bairro"]) expect(responder(m, ctx())).toBe(entrega);
  });
  it("reconhece diferentes formas de perguntar sobre débito", () => {
    for (const pergunta of ["Vocês pagam no débito?", "Passam cartão de débito?", "Aceita débito?", "Posso pagar no cartão de débito?"]) {
      expect(responder(pergunta, ctx())).toBe(d.faqsDemo[1]!.resposta);
    }
  });
  it("reconhece perguntas informais sobre entrega e encomendas", () => {
    expect(responder("Tem delivery?", ctx())).toBe(d.faqsDemo[0]!.resposta);
    expect(responder("Consigo fazer uma encomenda?", ctx())).toBe(d.faqsDemo[2]!.resposta);
  });
  it("pagamento com outras palavras", () => {
    expect(responder("posso pagar com pix?", ctx())).toBe(d.faqsDemo[1]!.resposta);
  });
  it("FAQ de horário vence a aba Horários", () => {
    const faqs = [...d.faqsDemo, { id: "x", pergunta: "Qual o horário de funcionamento?", resposta: "Resposta personalizada" }];
    expect(responder("que horas vocês abrem?", ctx(faqs))).toBe("Resposta personalizada");
  });
  it("sem FAQ correspondente usa Horários", () => {
    expect(responder("Qual o horário?", ctx())).toContain("Nosso horário");
  });
});

describe("respostas contextuais de funcionamento", () => {
  it("responde diretamente quando perguntam se abre no sábado", () => {
    expect(responder("Vocês abrem no sábado?", ctx())).toBe("Sim! Abrimos sábado, das 07:00 às 13:00. 😊");
  });
  it("informa quando a empresa está fechada no domingo", () => {
    expect(responder("Abre domingo?", ctx())).toBe("Não abrimos domingo. Nosso estabelecimento fica fechado nesse dia. 😊");
  });
  it("mostra a semana organizada, agrupando dias com o mesmo horário e usando quebras de linha reais", () => {
    const resposta = responder("Qual o horário de funcionamento?", ctx());
    expect(resposta).toContain("Segunda a sexta-feira: 07:00 às 19:00");
    expect(resposta).toContain("Sábado: 07:00 às 13:00");
    expect(resposta).toContain("Domingo: Fechado");
    expect(resposta).toContain("\n");
    expect(resposta).not.toContain("\\n");
  });
  it("pergunta o dia quando a dúvida de horário está genérica", () => {
    expect(responder("Qual o horário?", ctx())).toContain("Nosso horário");
  });
});


describe("conversa natural e contexto", () => {
  it("responde a saudações e perguntas sociais", () => {
    expect(responder("Oi!", ctx())).toBe(d.instrucoesDemo.boasVindas);
    expect(responder("Tudo bem?", ctx())).toContain("Tudo ótimo");
  });
  it("entende uma pergunta curta sobre sábado pelo contexto de horário", () => {
    expect(responder("E no sábado?", ctx(), ["Qual é o horário de funcionamento?"])).toContain("Abrimos sábado");
  });
  it("normaliza quebras de linha literais em respostas de FAQ", () => {
    const faqs = [{ id: "x", pergunta: "Qual o endereço?", resposta: "Rua A\\nNúmero 10" }];
    expect(responder("Qual o endereço?", ctx(faqs))).toBe("Rua A\nNúmero 10");
  });
  it("não inventa endereço quando não há informação cadastrada", () => {
    expect(responder("Qual o endereço?", ctx())).toContain("não tenho o endereço cadastrado");
  });
  it("lista produtos com respostas objetivas", () => {
    expect(responder("Ver produtos", ctx())).toContain("Pão francês");
  });
  it("oferece ajuda humana quando não reconhece a informação", () => {
    expect(responder("Vocês oferecem um serviço que não conheço?", ctx())).toContain("Vou chamar alguém da equipe");
  });
});
