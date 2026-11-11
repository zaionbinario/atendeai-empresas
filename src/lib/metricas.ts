import type { Conversa } from "./types";

/** Os indicadores recomeçam apenas após o reset manual; o histórico é preservado. */
export function calcularIndicadores(conversas: Conversa[], ultimoReset: number | null) {
  const contabilizaveis = ultimoReset === null
    ? conversas
    : conversas.filter((conversa) => {
        const instante = conversa.ultimaAtividadeEm ? Date.parse(conversa.ultimaAtividadeEm) : NaN;
        // Conversas antigas sem data completa não voltam a entrar após o reset.
        return Number.isFinite(instante) && instante > ultimoReset;
      });

  return {
    conversas: contabilizaveis.length,
    clientes: new Set(contabilizaveis.map((conversa) => conversa.cliente)).size,
    ia: contabilizaveis.filter((conversa) => conversa.status === "ia").length,
    humanos: contabilizaveis.filter((conversa) => conversa.status === "humano").length,
  };
}
