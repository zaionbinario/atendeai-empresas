import { describe, expect, it } from "vitest";
import { iaPodeResponder, registrarRespostaHumana, transferirAtendimento } from "@/lib/atendimento";
import type { Conversa, Mensagem } from "@/lib/types";

const base: Conversa[] = [
  { id: "simulador", cliente: "Cliente", ultimaMensagem: "Oi", atualizadaEm: "09:00", status: "ia", mensagens: [] },
  { id: "outra", cliente: "Outra pessoa", ultimaMensagem: "Oi", atualizadaEm: "09:00", status: "ia", mensagens: [] },
];
const resposta: Mensagem = { id: "m1", de: "humano", texto: "Olá! Posso ajudar?", hora: "09:10" };

describe("transferência de atendimento", () => {
  it("pausa a IA apenas no atendimento assumido", () => {
    const resultado = transferirAtendimento(base, "simulador", "humano");
    expect(iaPodeResponder(true, resultado[0])).toBe(false);
    expect(iaPodeResponder(true, resultado[1])).toBe(true);
    expect(iaPodeResponder(false, resultado[1])).toBe(false);
    expect(base[0]?.status).toBe("ia");
  });
  it("registra a resposta humana apenas na conversa assumida", () => {
    const assumidas = transferirAtendimento(base, "simulador", "humano");
    const resultado = registrarRespostaHumana(assumidas, "simulador", resposta, "2026-11-11T21:00:00Z");
    expect(resultado[0]?.mensagens).toEqual([resposta]);
    expect(resultado[0]?.ultimaAtividadeEm).toBe("2026-11-11T21:00:00Z");
    expect(resultado[1]?.mensagens).toEqual([]);
    expect(registrarRespostaHumana(base, "simulador", resposta, "2026-11-11T21:00:00Z")).toEqual(base);
  });
  it("ao devolver para a IA ela volta a poder responder", () => {
    const assumidas = transferirAtendimento(base, "simulador", "humano");
    const devolvidas = transferirAtendimento(assumidas, "simulador", "ia");
    expect(iaPodeResponder(true, devolvidas[0])).toBe(true);
  });
});
