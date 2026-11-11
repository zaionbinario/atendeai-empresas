import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, Building2, Package, Clock, HelpCircle, Bot, MessageCircle, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/empresas", label: "Empresas", icon: Building2 },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/horarios", label: "Horários", icon: Clock },
  { to: "/perguntas", label: "Perguntas frequentes", icon: HelpCircle },
  { to: "/atendente", label: "Atendente virtual", icon: Bot },
  { to: "/simulador", label: "Simulador", icon: MessageCircle },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const side = (
    <nav className="flex flex-col gap-1">
      {nav.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} onClick={() => setOpen(false)}
          className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            path === to ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent")}>
          <Icon className="h-5 w-5" />{label}
        </Link>
      ))}
    </nav>
  );
  const logo = (
    <div className="flex items-center gap-2 px-2">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground"><Bot className="h-5 w-5" /></div>
      <span className="font-display text-xl font-bold text-sidebar-foreground">Atende<span className="text-sidebar-primary">AI</span></span>
    </div>
  );
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-8 bg-sidebar p-4 lg:flex">
        {logo}{side}
        <div className="mt-auto rounded-xl bg-sidebar-accent p-3 text-xs text-sidebar-foreground/80">Versão de demonstração — os dados não são salvos.</div>
      </aside>
      <header className="sticky top-0 z-40 flex items-center justify-between bg-sidebar p-3 lg:hidden">
        {logo}
        <button aria-label="Abrir menu" onClick={() => setOpen(!open)} className="rounded-lg p-2 text-sidebar-foreground">{open ? <X /> : <Menu />}</button>
      </header>
      {open && <div className="sticky top-14 z-30 bg-sidebar p-3 lg:hidden">{side}</div>}
      <main className="p-4 sm:p-8 lg:ml-64">{children}</main>
    </div>
  );
}
