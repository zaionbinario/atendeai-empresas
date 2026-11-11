import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Bot, Timer, Star } from "lucide-react";
import { Card, PageHeader } from "@/components/app/ui";
import { resumoDemo as r } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Painel — Zyon Desk" }, { name: "description", content: "Resumo do atendimento automatizado da sua empresa." }, { property: "og:title", content: "Painel — Zyon Desk" }, { property: "og:description", content: "Resumo do atendimento automatizado da sua empresa." }] }),
  component: Painel,
});
const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
function Painel() {
  const max = Math.max(...r.semana);
  const kpis = [
    { l: "Conversas hoje", v: r.conversasHoje, i: MessageCircle },
    { l: "Resolvidas pela IA", v: r.resolvidasIA + "%", i: Bot },
    { l: "Tempo médio de resposta", v: r.tempoMedio, i: Timer },
    { l: "Satisfação dos clientes", v: r.satisfacao + " / 5", i: Star },
  ];
  return (<>
    <PageHeader title="Olá! 👋" desc="Veja como está o atendimento da sua empresa hoje." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map(({ l, v, i: I }) => (
        <Card key={l} className="relative overflow-hidden"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{l}</span>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow"><I className="h-5 w-5" /></span></div>
          <p className="mt-3 font-display text-3xl font-bold">{v}</p></Card>
      ))}
    </div>
    <div className="mt-4 grid gap-4 xl:grid-cols-5">
      <Card className="xl:col-span-3"><h2 className="font-display text-lg font-bold">Conversas na semana</h2>
        <div className="mt-6 flex h-48 items-end gap-3">
          {r.semana.map((n, i) => (<div key={i} className="flex h-full flex-1 flex-col items-center gap-2">
            <span className="text-xs font-semibold">{n}</span>
            <div className="flex w-full flex-1 items-end"><div className="w-full rounded-t-lg bg-linear-to-t from-primary/40 to-primary-glow transition-all" style={{ height: `${(n / max) * 100}%` }} /></div>
            <span className="text-xs text-muted-foreground">{dias[i]}</span></div>))}
        </div></Card>
      <Card className="xl:col-span-2"><h2 className="font-display text-lg font-bold">Últimas conversas</h2>
        <ul className="mt-4 divide-y">{r.recentes.map((c) => (
          <li key={c.nome} className="flex items-center gap-3 py-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-brand font-bold text-primary-foreground">{c.nome[0]}</div>
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{c.nome} <span className="font-normal text-muted-foreground">· {c.hora}</span></p>
              <p className="truncate text-sm text-muted-foreground">{c.msg}</p></div>
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", c.status === "Resolvida" ? "bg-accent text-accent-foreground" : "bg-warning/15 text-warning")}>{c.status}</span>
          </li>))}</ul></Card>
    </div>
  </>);
}
