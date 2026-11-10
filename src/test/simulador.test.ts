import { describe, it, expect } from "vitest";
import { responder } from "@/lib/simulador";
import * as d from "@/lib/demo-data";
const ctx = (faqs = d.faqsDemo) => ({ produtos: d.produtosDemo, faqs, horarios: d.horariosDemo, instrucoes: d.instrucoesDemo });
const entrega = d.faqsDemo[0].resposta;
describe("prioridade das Perguntas frequentes", () => {
  it("variações reconhecem a mesma pergunta", () => {
    for (const m of ["Vocês fazem entrega?", "vcs entregam em casa?", "Tem delivery?", "fazem entregas no meu bairro"]) expect(responder(m, ctx())).toBe(entrega);
  });
  it("pagamento com outras palavras", () => {
    expect(responder("posso pagar com pix?", ctx())).toBe(d.faqsDemo[1].resposta);
  });
  it("FAQ de horário vence a aba Horários", () => {
    const faqs = [...d.faqsDemo, { id: "x", pergunta: "Qual o horário de funcionamento?", resposta: "Resposta personalizada" }];
    expect(responder("que horas vocês abrem?", ctx(faqs))).toBe("Resposta personalizada");
  });
  it("sem FAQ correspondente usa Horários", () => {
    expect(responder("Qual o horário?", ctx())).toContain("Nosso horário");
  });
});
