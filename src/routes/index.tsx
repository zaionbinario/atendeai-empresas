import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Bot, Timer, Star, ArrowUpRight, Building2, Package, Clock3, CircleHelp, Sparkles, TrendingUp, Zap, CheckCircle2, Rocket, Users } from "lucide-react";
import { Card, PageHeader } from "@/components/app/ui";
import { resumoDemo as r } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Painel — Zyon Chat" }, { name: "description", content: "Resumo do atendimento automatizado da sua empresa." }, { property: "og:title", content: "Painel — Zyon Chat" }, { property: "og:description", content: "Resumo do atendimento automatizado da sua empresa." }] }),
  component: Painel,
});
const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
function Painel() {
  const { conversas, botAtivo } = useStore();
  const clientesUnicos = new Set(conversas.map((c) => c.cliente)).size;
  const max = Math.max(...r.semana);
  const kpis = [
    { l: "Conversas registradas", v: conversas.length, i: MessageCircle, hint: "Histórico salvo neste navegador", color: "text-emerald-300 bg-emerald-400/10" },
    { l: "Clientes atendidos", v: clientesUnicos, i: Users, hint: "Clientes no histórico", color: "text-cyan-300 bg-cyan-400/10" },
    { l: "Atendimentos pela IA", v: conversas.filter((c) => c.status === "ia").length, i: Bot, hint: "Conversas acompanhadas pelo bot", color: "text-sky-300 bg-sky-400/10" },
    { l: "Atendimentos humanos", v: conversas.filter((c) => c.status === "humano").length, i: Users, hint: "Precisam de acompanhamento", color: "text-violet-300 bg-violet-400/10" },
    { l: "Status do atendente", v: botAtivo ? "Ativo" : "Pausado", i: botAtivo ? Bot : Timer, hint: "Controle no topo do painel", color: botAtivo ? "text-emerald-300 bg-emerald-400/10" : "text-amber-300 bg-amber-400/10" },
  ];
  const atalhos = [
    { to: "/empresas", label: "Cadastrar empresa", desc: "Gerencie seus negócios", icon: Building2, color: "bg-sky-500/10 text-sky-600" },
    { to: "/produtos", label: "Adicionar produtos", desc: "Atualize preços e descrições", icon: Package, color: "bg-violet-500/10 text-violet-600" },
    { to: "/horarios", label: "Configurar horários", desc: "Informe quando abre e fecha", icon: Clock3, color: "bg-amber-500/10 text-amber-600" },
    { to: "/perguntas", label: "Perguntas frequentes", desc: "Cadastre respostas para a IA", icon: CircleHelp, color: "bg-amber-500/15 text-amber-300" },
    { to: "/atendente", label: "Atendente virtual", desc: "Personalize o comportamento da IA", icon: Bot, color: "bg-emerald-500/15 text-emerald-300" },
  ];
  return (<>
    <PageHeader title="Visão geral" desc="Acompanhe o desempenho do atendimento da sua empresa." />
    <section className="relative mb-5 overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-r from-[#062d25] via-[#064b39] to-[#087b50] p-6 text-white shadow-[0_18px_55px_-30px_rgba(16,185,129,.55)] sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border-[28px] border-white/5" />
      <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
      <Rocket className="pointer-events-none absolute -right-2 -top-1 hidden h-44 w-44 rotate-45 text-emerald-200/20 sm:block" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold"><Sparkles className="h-3.5 w-3.5" /> Seu atendimento em um só lugar</div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Olá! Vamos cuidar dos seus clientes?</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/75">Configure sua empresa, deixe a IA preparada e acompanhe as conversas em tempo real.</p>
        </div>
        <Link to="/simulador" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-800 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">Testar meu atendente <ArrowUpRight className="h-4 w-4" /></Link>
      </div>
    </section>
    <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg font-bold">Resumo do atendimento</h2><span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Dados do histórico local</span></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {kpis.map(({ l, v, i: I, hint }) => (
        <Card key={l} className="group transition-all hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-muted-foreground">{l}</p><p className="mt-3 font-display text-3xl font-bold tracking-tight">{v}</p></div>
            <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-transform group-hover:scale-110", kpis.find((item) => item.l === l)?.color)}><I className="h-5 w-5" /></span></div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><TrendingUp className="h-3.5 w-3.5 text-primary" />{hint}</p>
        </Card>
      ))}
    </div>
    <div className="mt-5 grid gap-4 xl:grid-cols-5">
      <Card className="xl:col-span-3">
        <div className="flex items-center justify-between gap-3"><div><h2 className="font-display text-lg font-bold">Conversas na semana</h2><p className="mt-1 text-xs text-muted-foreground">Volume de mensagens recebidas por dia</p></div><span className="rounded-xl bg-accent p-2 text-accent-foreground"><MessageCircle className="h-5 w-5" /></span></div>
        <div className="mt-7 flex h-48 items-end gap-3 sm:gap-5">
          {r.semana.map((n, i) => (<div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="text-xs font-semibold text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">{n}</span>
            <div className="flex w-full flex-1 items-end"><div className={cn("w-full rounded-t-xl transition-all duration-300 group-hover:brightness-110", i === r.semana.length - 1 ? "bg-primary shadow-md shadow-primary/20" : "bg-primary/25")} style={{ height: `${(n / max) * 100}%` }} /></div>
            <span className={cn("text-xs", i === r.semana.length - 1 ? "font-bold text-primary" : "text-muted-foreground")}>{dias[i]}</span></div>))}
        </div>
      </Card>
      <Card className="xl:col-span-2">
        <div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-bold">Últimas conversas</h2><p className="mt-1 text-xs text-muted-foreground">Atividades recentes do atendimento</p></div><span className="rounded-xl bg-accent p-2 text-accent-foreground"><MessageCircle className="h-5 w-5" /></span></div>
        <ul className="mt-3 divide-y">{(conversas.length ? conversas.slice(0, 4).map((c) => ({ nome: c.cliente, msg: c.ultimaMensagem, hora: c.atualizadaEm, status: c.status === "humano" ? "Humano" : c.status === "resolvida" ? "Resolvida" : "IA" })) : r.recentes).map((c) => (
          <li key={c.nome} className="flex items-center gap-3 py-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary font-bold text-secondary-foreground">{c.nome[0]}</div>
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{c.nome} <span className="font-normal text-muted-foreground">· {c.hora}</span></p>
              <p className="truncate text-sm text-muted-foreground">{c.msg}</p></div>
            <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold", c.status === "Resolvida" ? "bg-accent text-accent-foreground" : "bg-warning/15 text-warning")}>{c.status}</span>
          </li>))}</ul>
      </Card>
    </div>
    <section className="mt-5">
      <div className="mb-3 flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /><h2 className="font-display text-lg font-bold">Acesso rápido</h2></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {atalhos.map(({ to, label, desc, icon: Icon, color }) => <Link key={to} to={to} className="group flex min-h-36 flex-col items-start gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.025] p-4 shadow-soft transition-all hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-[0_16px_35px_-22px_rgba(16,185,129,.6)]">
          <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", color)}><Icon className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{label}</span><span className="mt-1 block text-xs text-muted-foreground">{desc}</span></span>
          <span className="flex h-8 w-8 items-center justify-center self-end rounded-full bg-emerald-500/15 text-emerald-300 transition group-hover:bg-emerald-400 group-hover:text-slate-950"><ArrowUpRight className="h-4 w-4" /></span>
        </Link>)}
      </div>
    </section>
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><p className="text-sm font-semibold">Dica para melhorar seu atendimento</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Cadastre perguntas frequentes, horários e informações dos produtos. Quanto mais completo estiver o cadastro, mais útil será o atendente virtual.</p></div></div>
  </>);
}
