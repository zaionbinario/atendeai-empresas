import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, Package, Clock, HelpCircle, Bot, MessageCircle, Menu, X, Sparkles, ShieldCheck, ArrowUpRight, Bell, ChevronDown, Plug, Settings, Users, MessageSquareText, PauseCircle, PlayCircle, Sun, Moon, Headset, Phone, Mail, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { NotificationBell } from "./NotificationBell";
import { applyAppearance, loadAppearance } from "./AppearanceSettings";
import { SiteSearch } from "./SiteSearch";
import { supabase } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

const nav = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/simulador", label: "Simulador", icon: MessageCircle },
  { to: "/conversas", label: "Histórico de conversas", icon: MessageCircle },
  { to: "/notificacoes", label: "Notificações", icon: Bell },
  { to: "/respostas-rapidas", label: "Respostas rápidas", icon: MessageSquareText },
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
  const [suporteAberto, setSuporteAberto] = useState(false);
  const [menuContaAberto, setMenuContaAberto] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [erroSaida, setErroSaida] = useState("");
  const [temaClaro, setTemaClaro] = useState(false);
  const { botAtivo, setBotAtivo, conversas } = useStore();
  useEffect(() => { applyAppearance(loadAppearance()); }, []);
  const pendentes = conversas.filter((c) => c.aguardandoHumano === true).length;
  useEffect(() => {
    let claro = false;
    try { claro = localStorage.getItem("zyon-chat-tema") === "claro"; }
    catch { /* Mantém o tema escuro quando o armazenamento não está disponível. */ }
    setTemaClaro(claro);
    document.documentElement.classList.toggle("light", claro);
    document.documentElement.classList.toggle("dark", !claro);
    applyAppearance(loadAppearance());
  }, []);
  const alternarTema = () => {
    const novoTemaClaro = !temaClaro;
    setTemaClaro(novoTemaClaro);
    document.documentElement.classList.toggle("light", novoTemaClaro);
    document.documentElement.classList.toggle("dark", !novoTemaClaro);
    applyAppearance(loadAppearance());
    try { localStorage.setItem("zyon-chat-tema", novoTemaClaro ? "claro" : "escuro"); }
    catch { /* A troca visual funciona mesmo sem persistência. */ }
  };
  const sairDaConta = async () => {
    if (!supabase) { setErroSaida("A autenticação não está disponível no momento."); return; }
    setSaindo(true);
    setErroSaida("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setConfirmarSaida(false);
      setMenuContaAberto(false);
      window.location.assign("/login");
    } catch {
      setErroSaida("Não foi possível sair da conta. Tente novamente.");
    } finally { setSaindo(false); }
  };
  const side = (
    <nav className="flex flex-col gap-1" aria-label="Navegação principal">
      {nav.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} preload="intent" preloadDelay={50} onClick={() => setOpen(false)}
          className={cn("group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
            path === to ? "border border-emerald-400/30 bg-emerald-500/15 text-emerald-300 shadow-[0_0_22px_-12px_rgba(16,185,129,.8)] light:border-emerald-500/30 light:bg-emerald-50 light:text-emerald-800" : "text-slate-400 hover:bg-white/5 hover:text-white light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-900")}>
          <Icon className="h-[19px] w-[19px] shrink-0" />
          <span className="flex-1">{label}</span>
          {path === to && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
        </Link>
      ))}
      <button type="button" onClick={() => { setOpen(false); setSuporteAberto(true); }}
        className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-400 transition-all hover:bg-white/5 hover:text-white light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-900">
        <Headset className="h-[19px] w-[19px] shrink-0" />
        <span className="flex-1">Suporte</span>
      </button>
    </nav>
  );
  const logo = (
    <div className="flex items-center gap-3 px-2">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary/25"><Bot className="h-6 w-6" /></div>
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
    <div className="min-h-screen w-full min-w-0 overflow-x-clip bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col gap-8 border-r border-white/10 bg-[#090f12] p-4 lg:flex light:border-slate-200 light:bg-white">
        {logo}
        <div><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Menu principal</p>{side}</div>
        {helpCard}
        <div className="flex items-center gap-3 border-t border-white/10 px-2 pt-4 light:border-slate-200"><div className="grid h-10 w-10 place-items-center rounded-full bg-violet-500 text-lg font-bold text-white">Z</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white light:text-slate-900">Minha conta</p><p className="text-xs text-emerald-400 light:text-emerald-700">Plano demonstração</p></div><Users className="h-4 w-4 text-slate-500" /></div>
      </aside>
      <header className="sticky top-0 z-30 min-w-0 border-b border-white/10 bg-[#090f12]/95 px-3 py-2 lg:ml-64 lg:px-8 light:border-slate-200 light:bg-white/95">
        <div className="flex min-h-14 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <button aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen(!open)} className="shrink-0 rounded-xl p-2 text-slate-300 hover:bg-white/5 lg:hidden light:text-slate-700 light:hover:bg-slate-100">{open ? <X /> : <Menu />}</button>
            <div className="hidden min-w-0 w-full max-w-xl lg:block"><SiteSearch /></div>
            <div className="min-w-0 lg:hidden"><span className="whitespace-nowrap font-display text-base font-bold text-white light:text-slate-900">Zyon <span className="text-emerald-400">Chat</span></span></div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <button onClick={alternarTema} aria-label={temaClaro ? "Ativar tema escuro" : "Ativar tema claro"} title={temaClaro ? "Ativar tema escuro" : "Ativar tema claro"} className="inline-flex items-center gap-1.5 rounded-full border border-black bg-black p-2 text-xs font-semibold text-white transition hover:bg-zinc-800 sm:px-3">{temaClaro ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}<span className="hidden xl:inline">{temaClaro ? "Tema escuro" : "Tema claro"}</span></button>
            <button onClick={() => setBotAtivo(!botAtivo)} aria-label={botAtivo ? "Pausar bot" : "Ativar bot"} className={cn("inline-flex shrink-0 items-center gap-1 rounded-full border p-2 text-xs font-semibold sm:px-3", botAtivo ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 light:border-emerald-500/30 light:bg-emerald-50 light:text-emerald-800" : "border-amber-400/30 bg-amber-500/10 text-amber-300 light:border-amber-500/30 light:bg-amber-50 light:text-amber-800")} title="Alternar atendimento automático">{botAtivo ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}<span className="hidden sm:inline">{botAtivo ? "Bot ativo" : "Bot pausado"}</span></button>
            {pendentes > 0 && <Link to="/conversas" aria-label={pendentes + " conversas aguardando atendimento humano"} title="Conversas aguardando atendimento" className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-500/50 bg-red-500/15 px-2 py-2 text-xs font-bold text-red-300 hover:bg-red-500/25 light:text-red-700"><Users className="h-4 w-4" /><span>{pendentes}</span><span className="hidden xl:inline">Aguardando atendente</span></Link>}
            <NotificationBell />
            <div className="hidden h-8 w-px bg-white/10 sm:block light:bg-slate-200" />
            <div className="relative">
              <button type="button" aria-label="Abrir menu da conta" aria-expanded={menuContaAberto} aria-haspopup="menu" onClick={() => setMenuContaAberto(v => !v)} className="flex shrink-0 items-center gap-2 rounded-xl p-1 text-sm text-foreground hover:bg-muted">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary font-bold text-primary-foreground">Z</span>
                <span className="hidden xl:block">Minha conta</span><ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {menuContaAberto && <>
                <button type="button" aria-label="Fechar menu da conta" className="fixed inset-0 z-40 cursor-default" onClick={() => setMenuContaAberto(false)} />
                <div role="menu" aria-label="Minha conta" className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-border bg-card p-2 text-card-foreground shadow-xl">
                  <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">Minha conta</p>
                  <button type="button" role="menuitem" onClick={() => { setMenuContaAberto(false); setErroSaida(""); setConfirmarSaida(true); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-muted"><LogOut className="h-4 w-4" />Sair da conta</button>
                </div>
              </>}
            </div>
          </div>
        </div>
        <div className="mt-2 w-full lg:hidden"><SiteSearch /></div>
      </header>
      {open && <div className="fixed inset-x-0 top-[112px] bottom-0 z-50 flex flex-col gap-5 overflow-y-auto overscroll-contain touch-pan-y border-b border-white/10 bg-[#090f12] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl [-webkit-overflow-scrolling:touch] lg:hidden light:border-slate-200 light:bg-white">{side}{helpCard}</div>}
      {confirmarSaida && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4" onMouseDown={e => { if (e.target === e.currentTarget && !saindo) setConfirmarSaida(false); }}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="confirmar-saida-titulo" aria-describedby="confirmar-saida-texto" className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl">
            <h2 id="confirmar-saida-titulo" className="text-lg font-bold">Sair da conta?</h2>
            <p id="confirmar-saida-texto" className="mt-2 text-sm text-muted-foreground">Você tem certeza de que deseja encerrar sua sessão no Zyon Chat?</p>
            {erroSaida && <p role="alert" className="mt-3 text-sm text-destructive">{erroSaida}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={saindo} onClick={() => setConfirmarSaida(false)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancelar</button>
              <button type="button" disabled={saindo} onClick={() => { void sairDaConta(); }} className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-50">{saindo ? "Saindo..." : "Sim, sair"}</button>
            </div>
          </section>
        </div>
      )}
      {suporteAberto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSuporteAberto(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="titulo-suporte" className="w-full max-w-md rounded-2xl border border-white/10 bg-[#091b19] p-6 text-white shadow-2xl light:border-slate-200 light:bg-white light:text-slate-900">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2 text-emerald-400"><Headset className="h-5 w-5" /><span className="text-sm font-semibold">Central de ajuda</span></div>
                <h2 id="titulo-suporte" className="font-display text-2xl font-bold">Suporte Zyon Chat</h2>
                <p className="mt-2 text-sm text-slate-400 light:text-slate-600">Precisa de ajuda? Entre em contato pelos canais abaixo.</p>
              </div>
              <button type="button" aria-label="Fechar suporte" onClick={() => setSuporteAberto(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 p-4 light:border-slate-200">
                <div className="mb-1 flex items-center gap-2 text-sm text-slate-400 light:text-slate-600"><Phone className="h-4 w-4" /> Telefone / WhatsApp</div>
                <p className="font-semibold">+55 (62) 98570-7123</p>
                <a href="https://wa.me/5562985707123" target="_top" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-emerald-400 hover:underline">Conversar pelo WhatsApp <ExternalLink className="h-3.5 w-3.5" /></a>
              </div>
              <div className="rounded-xl border border-white/10 p-4 light:border-slate-200">
                <div className="mb-1 flex items-center gap-2 text-sm text-slate-400 light:text-slate-600"><Mail className="h-4 w-4" /> E-mail</div>
                <p className="break-all font-semibold">isacnascimento186@gmail.com</p>
                <a href="mailto:isacnascimento186@gmail.com?subject=Suporte%20Zyon%20Chat" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-emerald-400 hover:underline">Enviar e-mail <ExternalLink className="h-3.5 w-3.5" /></a>
              </div>
            </div>
          </section>
        </div>
      )}
      <main className="min-h-[calc(100vh-76px)] min-w-0 max-w-full p-4 sm:p-7 lg:ml-64 lg:p-8"><div className="mx-auto w-full min-w-0 max-w-[1440px]">{children}</div></main>
    </div>
  );
}
