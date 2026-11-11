import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, UserRound, Bot, CheckCircle2, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { Btn, Card, PageHeader } from "@/components/app/ui";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/conversas")({
  head: () => ({ meta: [{ title: "Conversas — Zyon Chat" }] }),
  component: Conversas,
});
function Conversas() {
  const { conversas, setConversas } = useStore();
  const assumir = (id: string) => {
    setConversas(conversas.map((c) => c.id === id ? { ...c, status: "humano" } : c));
    toast.success("Conversa atribuída ao atendimento humano.");
  };
  const devolver = (id: string) => {
    setConversas(conversas.map((c) => c.id === id ? { ...c, status: "ia" } : c));
    toast.success("Conversa devolvida para a IA.");
  };
  return (<>
    <PageHeader title="Histórico de conversas" desc="Acompanhe os atendimentos recentes e assuma conversas quando necessário." />
    <div className="mb-4 grid gap-3 sm:grid-cols-3">
      <Card><p className="text-sm text-muted-foreground">Total de conversas</p><p className="mt-1 text-3xl font-bold">{conversas.length}</p></Card>
      <Card><p className="text-sm text-muted-foreground">Com atendimento humano</p><p className="mt-1 text-3xl font-bold">{conversas.filter((c) => c.status === "humano").length}</p></Card>
      <Card><p className="text-sm text-muted-foreground">Atendidas pela IA</p><p className="mt-1 text-3xl font-bold">{conversas.filter((c) => c.status === "ia").length}</p></Card>
    </div>
    <Card className="space-y-3">
      {conversas.length === 0 ? <div className="py-12 text-center"><MessageCircle className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-3 font-semibold">Nenhuma conversa registrada ainda</p><p className="mt-1 text-sm text-muted-foreground">Use o simulador para criar atendimentos de demonstração.</p></div> :
      conversas.map((c) => <div key={c.id} className="rounded-xl border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-secondary"><UserRound className="h-5 w-5" /></span><div className="min-w-0"><p className="font-semibold">{c.cliente}</p><p className="truncate text-sm text-muted-foreground">{c.ultimaMensagem}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3 w-3" />{c.atualizadaEm} · {c.mensagens.length} mensagens</p></div></div>
          <span className={c.status === "humano" ? "rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600" : c.status === "resolvida" ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600" : "rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-600"}>{c.status === "humano" ? "Humano" : c.status === "resolvida" ? "Resolvida" : "IA"}</span>
        </div>
        <details className="mt-3"><summary className="cursor-pointer text-sm font-medium text-primary">Ver mensagens</summary><div className="mt-3 space-y-2 rounded-lg bg-muted/40 p-3">{c.mensagens.map((m) => <div key={m.id} className={m.de === "cliente" ? "text-right" : "text-left"}><span className="inline-block max-w-[90%] rounded-xl bg-background px-3 py-2 text-sm">{m.texto}</span><p className="mt-0.5 text-[10px] text-muted-foreground">{m.de === "cliente" ? "Cliente" : "Atendente"} · {m.hora}</p></div>)}</div></details>
        <div className="mt-3 flex justify-end">{c.status === "humano" ? <Btn variant="outline" onClick={() => devolver(c.id)}><Bot className="h-4 w-4" /> Devolver para IA</Btn> : <Btn onClick={() => assumir(c.id)}><UserRound className="h-4 w-4" /> Assumir conversa</Btn>}</div>
      </div>)}
    </Card>
  </>);
}
