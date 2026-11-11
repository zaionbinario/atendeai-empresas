import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, Building2, Package, Clock, HelpCircle, Bot, MessageCircle, Menu, X, Sparkles, ShieldCheck, ArrowUpRight, CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Visão geral", icon: LayoutDashboard },
  { to: "/empresas", label: "Empresas", icon: Building2 },
  { to: "/produtos", label: "Produtos e serviços", icon: Package },
  { to: "/horarios", label: "Horários", icon: Clock },
  { to: "/perguntas", label: "Perguntas frequentes", icon: HelpCircle },
  { to: "/atendente", label: "Configurar atendente", icon: Bot },
  { to: "/simulador", label: "Testar atendimento", icon: MessageCircle },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const side = (
    <nav className="flex flex-col gap-1" aria-label="Navegação principal">
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/45">Workspace</p>
      {nav.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} onClick={() => setOpen(false)}
          className={cn("group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
            path === to ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-black/10" : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
          <Icon className="h-[18px] w-[18px] shrink-0" />
          <span className="flex-1">{label}</span>
          {path === to && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
        </Link>
      ))}
    </nav>
  );
  const logo = (
    <div className="flex items-center gap-3 px-2">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-black/15"><Bot className="h-5 w-5" /></div>
      <div><span className="font-display text-xl font-bold tracking-tight text-sidebar-foreground">Atende<span className="text-sidebar-primary">AI</span></span><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/45">Central inteligente</p></div>
    </div>
  );
  const helpCard = (
    <div className="mt-auto space-y-3">
      <div className="rounded-2xl border border-sidebar-foreground/10 bg-sidebar-accent/70 p-3.5">
        <div className="mb-2 flex items-center gap-2 text-sidebar-primary"><Sparkles className="h-4 w-4" /><span className="text-xs font-bold">Dica rápida</span></div>
        <p className="text-xs leading-relaxed text-sidebar-foreground/75">Mantenha seus horários e respostas atualizados para a IA atender melhor.</p>
        <Link to="/perguntas" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sidebar-primary hover:underline">Editar respostas <ArrowUpRight className="h-3 w-3" /></Link>
      </div>
      <div className="flex items-center gap-2 rounded-xl px-2 py-1 text-[11px] text-sidebar-foreground/45"><ShieldCheck className="h-4 w-4" /> Ambiente de demonstração</div>
    </div>
  );
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-8 border-r border-sidebar-border/60 bg-sidebar p-4 lg:flex">
        {logo}{side}{helpCard}
      </aside>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-sidebar-border/60 bg-sidebar p-3 lg:hidden">
        {logo}
        <button aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen(!open)} className="rounded-xl p-2 text-sidebar-foreground hover:bg-sidebar-accent">{open ? <X /> : <Menu />}</button>
      </header>
      {open && <div className="sticky top-14 z-30 space-y-5 border-b border-sidebar-border/60 bg-sidebar p-4 lg:hidden">{side}{helpCard}</div>}
      <main className="min-h-screen p-4 sm:p-7 lg:ml-64 lg:p-9">
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}
