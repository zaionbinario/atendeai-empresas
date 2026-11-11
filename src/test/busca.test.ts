import { describe, expect, it } from "vitest";
import { buscarPaginas, normalizarBusca } from "@/lib/busca";

describe("busca global de páginas", () => {
  it("ignora acentos e diferenças de maiúsculas", () => {
    expect(normalizarBusca("  NOTIFICAÇÕES  ")).toBe("notificacoes");
  });
  it("encontra notificações no singular, plural e com acentos", () => {
    expect(buscarPaginas("notificação")[0]?.to).toBe("/notificacoes");
    expect(buscarPaginas("notificacoes")[0]?.to).toBe("/notificacoes");
  });
  it("encontra o histórico de conversas sem acento", () => {
    expect(buscarPaginas("historico")[0]?.to).toBe("/conversas");
    expect(buscarPaginas("histórico")[0]?.to).toBe("/conversas");
  });
  it("encontra páginas por sinônimos e palavras parciais", () => {
    expect(buscarPaginas("whatsapp")[0]?.to).toBe("/integracoes");
    expect(buscarPaginas("respostas rapidas")[0]?.to).toBe("/respostas-rapidas");
    expect(buscarPaginas("admin")[0]?.to).toBe("/administracao");
  });
  it("mostra sugestões iniciais e nenhuma página para termos sem correspondência", () => {
    expect(buscarPaginas("")).toHaveLength(13);
    expect(buscarPaginas("xyzzzz")).toEqual([]);
  });
});
