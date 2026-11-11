import { describe, expect, it } from "vitest";
import { calcularIndicadores, calcularMensagensRecebidasNaSemana } from "@/lib/metricas";
import type { Conversa } from "@/lib/types";

const conversa = (id: string, cliente: string, status: Conversa["status"], ultimaAtividadeEm?: string): Conversa =>
  ({ id, cliente, status, ultimaMensagem: "Olá", atualizadaEm: "11:20", mensagens: [], ...(ultimaAtividadeEm ? { ultimaAtividadeEm } : {}) });

describe("contadores com reset manual", () => {
  const antigas = [conversa("1", "João", "ia", "2026-11-11T10:00:00.000Z"), conversa("2", "Maria", "humano")];
  const marco = Date.parse("2026-11-11T12:00:00.000Z");

  it("mostra todo o histórico quando ainda não houve reset", () => {
    expect(calcularIndicadores(antigas, null)).toEqual({ conversas: 2, clientes: 2, ia: 1, humanos: 1 });
  });
  it("zera contagens sem apagar as conversas antigas", () => {
    expect(calcularIndicadores(antigas, marco)).toEqual({ conversas: 0, clientes: 0, ia: 0, humanos: 0 });
    expect(antigas).toHaveLength(2);
  });
  it("contabiliza apenas atendimentos novos após o reset e não duplica clientes", () => {
    const recentes = [
      ...antigas,
      conversa("3", "João", "ia", "2026-11-11T12:01:00.000Z"),
      conversa("4", "João", "humano", "2026-11-11T12:02:00.000Z"),
      conversa("5", "Ana", "ia", "2026-11-11T12:03:00.000Z"),
    ];
    expect(calcularIndicadores(recentes, marco)).toEqual({ conversas: 3, clientes: 2, ia: 2, humanos: 1 });
  });
  it("uma conversa existente que recebe nova mensagem volta a contar", () => {
    const reativada = [{ ...antigas[0]!, ultimaAtividadeEm: "2026-11-11T13:00:00.000Z" }];
    expect(calcularIndicadores(reativada, marco)).toEqual({ conversas: 1, clientes: 1, ia: 1, humanos: 0 });
  });
});

describe("volume semanal de mensagens recebidas", () => {
  const recebida = (dia: number, hora: number, id: string) =>
    ({ id, de: "cliente" as const, texto: "Oi", hora: "10:00", enviadaEm: new Date(2026, 10, dia, hora).toISOString() });
  const cria = (mensagens: Conversa["mensagens"]): Conversa =>
    ({ id: "semana", cliente: "Cliente", ultimaMensagem: "Oi", atualizadaEm: "10:00", status: "ia", mensagens });

  it("começa com todos os dias zerados quando não há mensagens", () => {
    expect(calcularMensagensRecebidasNaSemana([], null, new Date(2026, 10, 11))).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it("conta cada mensagem do cliente na semana correta, de segunda a domingo", () => {
    const dados = cria([
      recebida(8, 14, "anterior"),
      recebida(9, 10, "seg"),
      recebida(9, 11, "seg2"),
      recebida(11, 10, "qua"),
      recebida(15, 10, "dom"),
      recebida(16, 10, "proxima"),
      { id: "bot", de: "bot", texto: "Olá", hora: "10:01", enviadaEm: new Date(2026, 10, 11, 10).toISOString() },
      { id: "legado", de: "cliente", texto: "Antiga", hora: "10:00" },
    ]);
    expect(calcularMensagensRecebidasNaSemana([dados], null, new Date(2026, 10, 11)))
      .toEqual([2, 0, 1, 0, 0, 0, 1]);
  });

  it("respeita o reset manual sem apagar o histórico", () => {
    const antes = recebida(11, 9, "antes");
    const depois = recebida(11, 11, "depois");
    const dataReset = new Date(2026, 10, 11, 10).getTime();
    const dados = cria([antes, depois]);
    expect(calcularMensagensRecebidasNaSemana([dados], dataReset, new Date(2026, 10, 11)))
      .toEqual([0, 0, 1, 0, 0, 0, 0]);
    expect(dados.mensagens).toHaveLength(2);
  });
});
