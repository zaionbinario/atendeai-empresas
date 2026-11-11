import type { Conversa, Mensagem } from "./types";

/** Cada atendimento tem seu próprio responsável; o botão global continua independente. */
export function iaPodeResponder(botAtivo: boolean, conversa?: Pick<Conversa, "status"> | null): boolean {
  return botAtivo && conversa?.status !== "humano";
}

/** Reconhece somente uma transferência afirmativa, não um oferecimento opcional de ajuda. */
export function respostaSolicitaHumano(resposta: string): boolean {
  const normalizada = resposta.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return /\b(vou chamar alguem|vou pedir para a equipe|vou transferir|vou encaminhar)\b/.test(normalizada);
}

export function transferirAtendimento(
  conversas: Conversa[],
  id: string,
  responsavel: "humano" | "ia",
): Conversa[] {
  return conversas.map((c) => c.id === id ? { ...c, status: responsavel } : c);
}

/** Guarda a resposta humana sem enviar nada ao WhatsApp (integração ainda ausente). */
export function registrarRespostaHumana(
  conversas: Conversa[],
  id: string,
  mensagem: Mensagem,
  dataIso: string,
): Conversa[] {
  return conversas.map((c) => {
    if (c.id !== id || c.status !== "humano" || mensagem.de !== "humano") return c;
    return {
      ...c,
      mensagens: [...c.mensagens, mensagem],
      ultimaMensagem: mensagem.texto,
      atualizadaEm: mensagem.hora,
      ultimaAtividadeEm: dataIso,
    };
  });
}
