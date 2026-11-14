import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Bot, Timer, ArrowUpRight, Building2, Package, Clock3, CircleHelp, Sparkles, TrendingUp, Zap, CheckCircle2, Rocket, Users } from "lucide-react";
import { Card, PageHeader } from "@/components/app/ui";
import { resumoDemo as r } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { calcularIndicadores, calcularMensagensRecebidasNaSemana } from "@/lib/metricas";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Painel — Zyon Chat" }, { name: "description", content: "Resumo do atendimento automatizado da sua empresa." }, { property: "og:title", content: "Painel — Zyon Chat" }, { property: "og:description", content: "Resumo do atendimento automatizado da sua empresa." }] }),
  component: Painel,
});
const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
function Painel() {
  const { conversas, botAtivo, ultimoResetIndicadores } = useStore();
  const indicadores = calcularIndicadores(conversas, ultimoResetIndicadores);
  const semana = calcularMensagensRecebidasNaSemana(conversas, ultimoResetIndicadores);
  const max = Math.max(1, ...semana);
  const diaAtual = (new Date().getDay() + 6) % 7;
  const kpis = [
    { l: "Conversas registradas", v: indicadores.conversas, i: MessageCircle, hint: "Desde o último reset manual", color: "text-emerald-300 bg-emerald-400/10 light:text-emerald-800 light:bg-emerald-50" },
    { l: "Clientes atendidos", v: indicadores.clientes, i: Users, hint: "Desde o último reset manual", color: "text-cyan-300 bg-cyan-400/10 light:text-cyan-800 light:bg-cyan-50" },
    { l: "Atendimentos pela IA", v: indicadores.ia, i: Bot, hint: "Desde o último reset manual", color: "text-sky-300 bg-sky-400/10 light:text-sky-800 light:bg-sky-50" },
    { l: "Atendimentos humanos", v: indicadores.humanos, i: Users, hint: "Desde o último reset manual", color: "text-violet-300 bg-violet-400/10 light:text-violet-800 light:bg-violet-50" },
    { l: "Status do atendente", v: botAtivo ? "Ativo" : "Pausado", i: botAtivo ? Bot : Timer, hint: "Controle no topo do painel", color: botAtivo ? "text-emerald-300 bg-emerald-400/10 light:text-emerald-800 light:bg-emerald-50" : "text-amber-300 bg-amber-400/10 light:text-amber-800 light:bg-amber-50" },
  ];
  const atalhos = [
    { to: "/produtos", label: "Adicionar produtos", desc: "Atualize preços e descrições", icon: Package, color: "bg-violet-500/10 text-violet-600" },
    { to: "/horarios", label: "Configurar horários", desc: "Informe quando abre e fecha", icon: Clock3, color: "bg-amber-500/10 text-amber-600" },
    { to: "/perguntas", label: "Perguntas frequentes", desc: "Cadastre respostas para a IA", icon: CircleHelp, color: "bg-amber-500/15 text-amber-300 light:bg-amber-50 light:text-amber-800" },
    { to: "/atendente", label: "Atendente virtual", desc: "Personalize o comportamento da IA", icon: Bot, color: "bg-emerald-500/15 text-emerald-300 light:bg-emerald-50 light:text-emerald-800" },
  ];
  return (<>
    <PageHeader title="Visão geral" desc="Acompanhe o desempenho do atendimento da sua empresa." />
    <section className="relative mb-5 overflow-hidden rounded-3xl border border-blue-400/25 bg-gradient-to-r from-[#091629] via-[#12365e] to-[#195da0] p-6 text-white shadow-[0_18px_55px_-30px_rgba(37,131,216,.45)] sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border-[28px] border-white/5" />
      <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
      <Rocket className="pointer-events-none absolute -right-2 -top-1 hidden h-44 w-44 rotate-45 text-blue-200/20 sm:block" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold"><Sparkles className="h-3.5 w-3.5" /> Seu atendimento em um só lugar</div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Olá! Vamos cuidar dos seus clientes?</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/75">Configure sua empresa, deixe a IA preparada e acompanhe as conversas em tempo real.</p>
        </div>
        <Link to="/simulador" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-900 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">Testar meu atendente <ArrowUpRight className="h-4 w-4" /></Link>
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
    <div className="mt-5 grid min-w-0 gap-3 sm:gap-4 xl:grid-cols-5">
      <Card className="min-w-0 xl:col-span-3">
        <div className="flex items-center justify-between gap-3"><div><h2 className="font-display text-lg font-bold">Conversas na semana</h2><p className="mt-1 text-xs text-muted-foreground">Volume de mensagens recebidas por dia</p></div><span className="rounded-xl bg-accent p-2 text-accent-foreground"><MessageCircle className="h-5 w-5" /></span></div>
        <div className="mt-5 flex h-36 min-w-0 items-end gap-1.5 sm:mt-7 sm:h-48 sm:gap-5">
          {semana.map((n, i) => (<div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="text-xs font-semibold text-muted-foreground">{n}</span>
            <div className="flex w-full flex-1 items-end"><div className={cn("w-full rounded-t-xl transition-all duration-300 group-hover:brightness-110", i === diaAtual ? "bg-primary shadow-md shadow-primary/20" : "bg-primary/25")} style={{ height: `${(n / max) * 100}%` }} /></div>
            <span className={cn("text-xs", i === diaAtual ? "font-bold text-primary" : "text-muted-foreground")}>{dias[i]}</span></div>))}
        </div>
      </Card>
      <Card className="min-w-0 xl:col-span-2">
        <div className="flex min-w-0 items-center justify-between gap-2"><div className="min-w-0"><h2 className="font-display text-base font-bold sm:text-lg">Últimas conversas</h2><p className="mt-1 text-xs text-muted-foreground">Atividades recentes do atendimento</p></div><span className="rounded-xl bg-accent p-2 text-accent-foreground"><MessageCircle className="h-5 w-5" /></span></div>
        <ul className="mt-3 divide-y">{(conversas.length ? conversas.slice(0, 4).map((c) => ({ nome: c.cliente, msg: c.ultimaMensagem, hora: c.atualizadaEm, status: c.status === "humano" ? "Humano" : c.status === "resolvida" ? "Resolvida" : "IA" })) : r.recentes).map((c) => (
          <li key={c.nome} className="flex min-w-0 items-center gap-2 py-2.5 sm:gap-3 sm:py-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary sm:h-10 sm:w-10 font-bold text-secondary-foreground">{c.nome[0]}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold sm:text-sm">{c.nome} <span className="font-normal text-muted-foreground">· {c.hora}</span></p>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">{c.msg}</p></div>
            <span className={cn("max-w-[72px] shrink-0 truncate rounded-full px-1.5 py-1 text-[9px] font-bold sm:max-w-none sm:px-2.5 sm:text-[10px]", c.status === "Resolvida" ? "bg-accent text-accent-foreground" : "bg-warning/15 text-warning")}>{c.status}</span>
          </li>))}</ul>
      </Card>
    </div>
    <section className="mt-5">
      <div className="mb-2 flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /><h2 className="font-display text-base font-bold">Acesso rápido</h2></div>
      <div className="grid min-w-0 grid-cols-1 gap-2 min-[430px]:grid-cols-2 xl:grid-cols-5">
        {atalhos.map(({ to, label, icon: Icon, color }) => <Link key={to} to={to} className="group flex min-w-0 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5 shadow-soft transition-all hover:border-emerald-400/40 hover:bg-white/[0.05] light:border-slate-200 light:bg-white light:hover:border-emerald-500/40 light:hover:bg-emerald-50">
          <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", color)}><Icon className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1 truncate text-xs font-semibold">{label}</span>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:text-emerald-300 light:group-hover:text-emerald-700" />
        </Link>)}
      </div>
    </section>
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><p className="text-sm font-semibold">Dica para melhorar seu atendimento</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Cadastre perguntas frequentes, horários e informações dos produtos. Quanto mais completo estiver o cadastro, mais útil será o atendente virtual.</p></div></div>
  </>);
}
