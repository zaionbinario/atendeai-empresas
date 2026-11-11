import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { StoreProvider, useStore } from "@/lib/store";

function StatusAtendente() {
  const { botAtivo, setBotAtivo } = useStore();
  return (
    <>
      <span data-testid="status">{botAtivo ? "Ativo" : "Pausado"}</span>
      <button type="button" onClick={() => setBotAtivo(!botAtivo)}>Alternar</button>
    </>
  );
}

const montar = () => render(
  <StrictMode>
    <StoreProvider><StatusAtendente /></StoreProvider>
  </StrictMode>
);

describe("status do atendimento automático", () => {
  beforeEach(() => localStorage.clear());

  it("migra a opção desativada salva nas Configurações, inclusive em StrictMode", async () => {
    localStorage.setItem("zyon-bot-ativo", "true");
    localStorage.setItem("zyon-chat-preferencias", JSON.stringify({ respostasAutomaticas: false }));
    montar();

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("Pausado"));
    await waitFor(() => expect(localStorage.getItem("zyon-bot-ativo")).toBe("false"));
  });

  it("não sobrescreve uma reativação posterior com a preferência antiga", async () => {
    localStorage.setItem("zyon-bot-ativo", "true");
    localStorage.setItem("zyon-chat-preferencias", JSON.stringify({ respostasAutomaticas: false }));
    const tela = montar();

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("Pausado"));
    fireEvent.click(screen.getByRole("button", { name: "Alternar" }));
    await waitFor(() => expect(localStorage.getItem("zyon-bot-ativo")).toBe("true"));
    tela.unmount();

    montar();
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("Ativo"));
  });
});
