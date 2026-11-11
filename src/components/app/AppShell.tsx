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
          className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
            path === to ? "bg-gradient-brand text-sidebar-primary-foreground shadow-glow" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
          <Icon className="h-5 w-5" />{label}
        </Link>
      ))}
    </nav>
  );
  const logo = (
    <div className="flex items-center gap-2 px-2">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-sidebar-primary-foreground shadow-glow"><Bot className="h-5 w-5" /></div>
      <span className="font-display text-xl font-bold text-sidebar-foreground">Atende<span className="text-gradient">AI</span></span>
    </div>
  );
  return (
    <div className="ambient relative min-h-screen bg-background">
      <div aria-hidden className="pointer-events-none fixed bottom-16 right-10 hidden h-40 w-40 animate-float rounded-[2.5rem] border border-border bg-gradient-brand opacity-10 blur-[2px] lg:block" />
      <aside className="fixed inset-y-0 left-0 hidden z-20 w-64 flex-col gap-8 border-r border-sidebar-border bg-sidebar/90 p-4 backdrop-blur-xl lg:flex">
        {logo}{side}
        <div className="mt-auto rounded-xl border border-sidebar-border bg-sidebar-accent p-3 text-xs text-sidebar-foreground/80">Versão de demonstração — os dados não são salvos.</div>
      </aside>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-sidebar-border bg-sidebar/90 p-3 backdrop-blur-xl lg:hidden">
        {logo}
        <button aria-label="Abrir menu" onClick={() => setOpen(!open)} className="rounded-lg p-2 text-sidebar-foreground">{open ? <X /> : <Menu />}</button>
      </header>
      {open && <div className="sticky top-14 z-30 border-b border-sidebar-border bg-sidebar p-3 lg:hidden">{side}</div>}
      <main key={path} className="relative z-10 animate-rise p-4 sm:p-8 lg:ml-64">{children}</main>
    </div>
  );
}
