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


/**
 * Quantidade de mensagens RECEBIDAS dos clientes por dia (seg. a dom.) na semana local atual.
 * Mensagens antigas sem data absoluta não são estimadas pelo texto de hora.
 * O reset manual exclui mensagens enviadas até o instante do reset.
 */
export function calcularMensagensRecebidasNaSemana(
  conversas: Conversa[],
  ultimoReset: number | null,
  referencia: Date = new Date(),
): number[] {
  const contagem = [0, 0, 0, 0, 0, 0, 0];
  const inicio = new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate());
  inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7));
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 7);

  for (const conversa of conversas) {
    for (const mensagem of conversa.mensagens) {
      if (mensagem.de !== "cliente" || !mensagem.enviadaEm) continue;
      const instante = Date.parse(mensagem.enviadaEm);
      if (!Number.isFinite(instante) || instante < inicio.getTime() || instante >= fim.getTime()) continue;
      if (ultimoReset !== null && instante <= ultimoReset) continue;

      const diaDaSemana = (new Date(instante).getDay() + 6) % 7;
      contagem[diaDaSemana]! += 1;
    }
  }
  return contagem;
}
