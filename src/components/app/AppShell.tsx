import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, Building2, Package, Clock, HelpCircle, Bot, MessageCircle, Menu, X, Sparkles, ShieldCheck, ArrowUpRight, Bell, ChevronDown, Plug, Settings, Users, MessageSquareText, PauseCircle, PlayCircle, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { NotificationBell } from "./NotificationBell";
import { SiteSearch } from "./SiteSearch";

const nav = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/simulador", label: "Simulador", icon: MessageCircle },
  { to: "/conversas", label: "Histórico de conversas", icon: MessageCircle },
  { to: "/notificacoes", label: "Notificações", icon: Bell },
  { to: "/respostas-rapidas", label: "Respostas rápidas", icon: MessageSquareText },
  { to: "/empresas", label: "Empresas", icon: Building2 },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/horarios", label: "Horários", icon: Clock },
  { to: "/perguntas", label: "Perguntas frequentes", icon: HelpCircle },
  { to: "/atendente", label: "Atendente virtual", icon: Bot },
  { to: "/integracoes", label: "Integrações", icon: Plug },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
  { to: "/administracao", label: "Administração", icon: ShieldCheck },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [temaClaro, setTemaClaro] = useState(false);
  const { botAtivo, setBotAtivo } = useStore();
  useEffect(() => {
    let claro = false;
    try { claro = localStorage.getItem("zyon-chat-tema") === "claro"; }
    catch { /* Mantém o tema escuro quando o armazenamento não está disponível. */ }
    setTemaClaro(claro);
    document.documentElement.classList.toggle("light", claro);
    document.documentElement.classList.toggle("dark", !claro);
  }, []);
  const alternarTema = () => {
    const novoTemaClaro = !temaClaro;
    setTemaClaro(novoTemaClaro);
    document.documentElement.classList.toggle("light", novoTemaClaro);
    document.documentElement.classList.toggle("dark", !novoTemaClaro);
    try { localStorage.setItem("zyon-chat-tema", novoTemaClaro ? "claro" : "escuro"); }
    catch { /* A troca visual funciona mesmo sem persistência. */ }
  };
  const side = (
    <nav className="flex flex-col gap-1" aria-label="Navegação principal">
      {nav.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} onClick={() => setOpen(false)}
          className={cn("group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
            path === to ? "border border-emerald-400/30 bg-emerald-500/15 text-emerald-300 shadow-[0_0_22px_-12px_rgba(16,185,129,.8)] light:border-emerald-500/30 light:bg-emerald-50 light:text-emerald-800" : "text-slate-400 hover:bg-white/5 hover:text-white light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-900")}>
          <Icon className="h-[19px] w-[19px] shrink-0" />
          <span className="flex-1">{label}</span>
          {path === to && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
        </Link>
      ))}
    </nav>
  );
  const logo = (
    <div className="flex items-center gap-3 px-2">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"><Bot className="h-6 w-6" /></div>
      <div><span className="font-display text-xl font-bold tracking-tight text-white light:text-slate-900">Zyon <span className="text-emerald-400">Chat</span></span><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">CHAT INTELIGENTE</p></div>
    </div>
  );
  const helpCard = (
    <div className="mt-auto space-y-3">
      <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 to-transparent p-4 light:from-emerald-50 light:to-white">
        <div className="mb-2 flex items-center gap-2 text-emerald-300 light:text-emerald-800"><Sparkles className="h-4 w-4" /><span className="text-xs font-bold">Dica rápida</span></div>
        <p className="text-xs leading-relaxed text-slate-400 light:text-slate-600">Mantenha seus horários e respostas atualizados para a IA atender melhor.</p>
        <Link to="/perguntas" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:underline light:text-emerald-800">Editar respostas <ArrowUpRight className="h-3 w-3" /></Link>
      </div>
      <div className="flex items-center gap-2 rounded-xl px-2 py-1 text-[11px] text-slate-500 light:text-slate-600"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Ambiente de demonstração</div>
    </div>
  );
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col gap-8 border-r border-white/10 bg-[#090f12] p-4 lg:flex light:border-slate-200 light:bg-white">
        {logo}
        <div><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Menu principal</p>{side}</div>
        {helpCard}
        <div className="flex items-center gap-3 border-t border-white/10 px-2 pt-4 light:border-slate-200"><div className="grid h-10 w-10 place-items-center rounded-full bg-violet-500 text-lg font-bold text-white">Z</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white light:text-slate-900">Minha conta</p><p className="text-xs text-emerald-400 light:text-emerald-700">Plano demonstração</p></div><Users className="h-4 w-4 text-slate-500" /></div>
      </aside>
      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-4 border-b border-white/10 bg-[#090f12]/95 px-4 lg:ml-64 lg:px-8 light:border-slate-200 light:bg-white/95">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen(!open)} className="rounded-xl p-2 text-slate-300 hover:bg-white/5 lg:hidden light:text-slate-700 light:hover:bg-slate-100">{open ? <X /> : <Menu />}</button>
          <div className="w-10 shrink-0 sm:w-full sm:max-w-xl"><SiteSearch /></div>
          <div className="lg:hidden">{logo}</div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3"><button onClick={alternarTema} aria-label={temaClaro ? "Ativar tema escuro" : "Ativar tema claro"} title={temaClaro ? "Ativar tema escuro" : "Ativar tema claro"} className="inline-flex items-center gap-1.5 rounded-full border border-black bg-black px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 sm:px-3">{temaClaro ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}<span className="hidden sm:inline">{temaClaro ? "Tema escuro" : "Tema claro"}</span></button><button onClick={() => setBotAtivo(!botAtivo)} className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-2 text-[10px] font-semibold sm:gap-2 sm:px-3 sm:text-xs", botAtivo ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 light:border-emerald-500/30 light:bg-emerald-50 light:text-emerald-800" : "border-amber-400/30 bg-amber-500/10 text-amber-300 light:border-amber-500/30 light:bg-amber-50 light:text-amber-800")} title="Alternar atendimento automático">{botAtivo ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}{botAtivo ? "Bot ativo" : "Bot pausado"}</button><NotificationBell /><div className="hidden h-8 w-px bg-white/10 sm:block light:bg-slate-200" /><button className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-white hover:bg-white/5 light:text-slate-900 light:hover:bg-slate-100"><span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-400 font-bold text-slate-950">Z</span><span className="hidden sm:block">Minha conta</span><ChevronDown className="h-4 w-4 text-slate-500" /></button></div>
      </header>
      {open && <div className="fixed inset-x-0 top-[76px] z-50 space-y-5 border-b border-white/10 bg-[#090f12] p-4 shadow-2xl lg:hidden light:border-slate-200 light:bg-white">{side}{helpCard}</div>}
      <main className="min-h-[calc(100vh-76px)] p-4 sm:p-7 lg:ml-64 lg:p-8"><div className="mx-auto w-full max-w-[1440px]">{children}</div></main>
    </div>
  );
}
