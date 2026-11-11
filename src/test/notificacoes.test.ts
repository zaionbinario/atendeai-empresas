import { describe, expect, it } from "vitest";
import { detectarEventosDeConversas, inserirNotificacao, marcarNotificacaoLida, type Notificacao } from "@/lib/notificacoes";
import { respostaSolicitaHumano } from "@/lib/atendimento";
import type { Conversa } from "@/lib/types";

const criarConversa = (id: string, status: Conversa["status"]): Conversa =>
  ({ id, cliente: "Joana", status, ultimaMensagem: "Olá", atualizadaEm: "15:00", mensagens: [] });

const exemplo: Notificacao = {
  id: "update-v1",
  tipo: "atualizacao",
  titulo: "Novidade",
  texto: "Central de notificações",
  criadaEm: "2026-11-11T21:00:00.000Z",
  lida: false,
};

describe("central de notificações", () => {
  it("mostra alerta quando conversa passa da IA para humano", () => {
    const eventos = detectarEventosDeConversas(new Map([["c1", "ia"]]), [criarConversa("c1", "humano")], true);
    expect(eventos).toHaveLength(1);
    expect(eventos[0]?.tipo).toBe("atendimento");
  });
  it("não repete alerta quando a conversa já estava em atendimento manual", () => {
    expect(detectarEventosDeConversas(new Map([["c1", "humano"]]), [criarConversa("c1", "humano")], true)).toEqual([]);
  });
  it("respeita preferência por não avisar novas conversas", () => {
    expect(detectarEventosDeConversas(new Map(), [criarConversa("c2", "ia")], false)).toEqual([]);
    expect(detectarEventosDeConversas(new Map(), [criarConversa("c2", "ia")], true)[0]?.tipo).toBe("nova_conversa");
  });
  it("evita avisos duplicados e marca como lidos", () => {
    const lista = inserirNotificacao(inserirNotificacao([], exemplo), exemplo);
    expect(lista).toHaveLength(1);
    expect(lista[0]?.lida).toBe(false);
    expect(marcarNotificacaoLida(lista, "update-v1")[0]?.lida).toBe(true);
  });
  it("distingue encaminhamento real de oferta opcional", () => {
    expect(respostaSolicitaHumano("Vou chamar alguém da equipe para te ajudar.")).toBe(true);
    expect(respostaSolicitaHumano("Posso chamar alguém para te ajudar.")).toBe(false);
    expect(respostaSolicitaHumano("Aceitamos Pix e cartão!")).toBe(false);
  });
});
