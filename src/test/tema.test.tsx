import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { readFileSync } from "node:fs";

vi.mock("@tanstack/react-router", () => ({
  useRouterState: () => "/",
  Link: ({ to, children, onClick, className }: { to: string; children: ReactNode; onClick?: () => void; className?: string }) => (
    <a href={to} onClick={onClick} className={className}>{children}</a>
  ),
}));

vi.mock("@/lib/store", () => ({
  useStore: () => ({ botAtivo: true, setBotAtivo: () => {} }),
}));

import { AppShell } from "@/components/app/AppShell";

const montar = () => render(<AppShell><div>Conteúdo do painel</div></AppShell>);

describe("temas do painel", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });
  afterEach(cleanup);

  it("ativa tema claro, preserva preferência e permite voltar ao escuro", () => {
    montar();
    expect(document.documentElement).toHaveClass("dark");
    fireEvent.click(screen.getByRole("button", { name: "Ativar tema claro" }));
    expect(document.documentElement).toHaveClass("light");
    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem("zyon-chat-tema")).toBe("claro");

    fireEvent.click(screen.getByRole("button", { name: "Ativar tema escuro" }));
    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement).not.toHaveClass("light");
    expect(localStorage.getItem("zyon-chat-tema")).toBe("escuro");
  });

  it("restaura o tema claro quando a página carrega novamente", () => {
    localStorage.setItem("zyon-chat-tema", "claro");
    montar();
    expect(document.documentElement).toHaveClass("light");
    expect(screen.getByRole("button", { name: "Ativar tema escuro" })).toBeInTheDocument();
  });

  it("define variáveis do tema claro na folha de estilos", () => {
    const css = readFileSync("src/styles.css", "utf8");
    expect(css).toContain("@custom-variant light");
    expect(css).toMatch(/\\.light \\{[\\s\\S]*?--background:\\s*oklch\\(/);
    expect(css).toMatch(/\\.light \\{[\\s\\S]*?--foreground:\\s*oklch\\(/);
  });
});
