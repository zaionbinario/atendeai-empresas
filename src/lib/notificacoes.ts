import type { Conversa } from "./types";

export type TipoNotificacao = "atendimento" | "nova_conversa" | "atualizacao";
export type Notificacao = {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  texto: string;
  criadaEm: string;
  lida: boolean;
  conversaId?: string;
};

// Atualize esta identificação quando publicar uma nova atualização que mereça um aviso.
// Não consulta o GitHub e não envia push: os avisos são internos a este navegador.
export const VERSAO_AVISO = "2026-11-11-central-notificacoes-v1";

export function inserirNotificacao(lista: Notificacao[], notificacao: Notificacao): Notificacao[] {
  if (lista.some((item) => item.id === notificacao.id)) return lista;
  return [notificacao, ...lista].slice(0, 100);
}

export function marcarNotificacaoLida(lista: Notificacao[], id: string): Notificacao[] {
  return lista.map((item) => item.id === id && !item.lida ? { ...item, lida: true } : item);
}

export function detectarEventosDeConversas(
  anteriores: ReadonlyMap<string, Conversa["status"]>,
  atuais: Conversa[],
  avisarNovasConversas: boolean,
): Array<Pick<Notificacao, "tipo" | "titulo" | "texto" | "conversaId">> {
  const eventos: Array<Pick<Notificacao, "tipo" | "titulo" | "texto" | "conversaId">> = [];
  for (const conversa of atuais) {
    const statusAnterior = anteriores.get(conversa.id);
    if (conversa.status === "humano" && statusAnterior !== "humano") {
      eventos.push({
        tipo: "atendimento",
        titulo: "Atendimento manual necessário",
        texto: `A conversa com ${conversa.cliente} está no atendimento humano.`,
        conversaId: conversa.id,
      });
    } else if (statusAnterior === undefined && avisarNovasConversas) {
      eventos.push({
        tipo: "nova_conversa",
        titulo: "Nova conversa registrada",
        texto: `${conversa.cliente} iniciou uma conversa no Zyon Chat.`,
        conversaId: conversa.id,
      });
    }
  }
  return eventos;
}
