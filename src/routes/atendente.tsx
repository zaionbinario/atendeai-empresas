import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Btn, Card, Field, Input, PageHeader, QuickAccess, Textarea, Toggle } from "@/components/app/ui";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Instrucoes } from "@/lib/types";

export const Route = createFileRoute("/atendente")({
  head: () => ({ meta: [{ title: "Atendente virtual — Zyon Chat" }, { name: "description", content: "Configure o nome, o tom de voz e as instruções do atendente com IA." }, { property: "og:title", content: "Atendente virtual — Zyon Chat" }, { property: "og:description", content: "Configure o nome, o tom de voz e as instruções do atendente com IA." }] }),
  component: Atendente,
});
const tons: { v: Instrucoes["tom"]; l: string; d: string }[] = [
  { v: "amigavel", l: "😊 Amigável", d: "Simpático e acolhedor" },
  { v: "formal", l: "👔 Formal", d: "Educado e profissional" },
  { v: "descontraido", l: "😎 Descontraído", d: "Leve e divertido" },
];
function Atendente() {
  const { instrucoes: i, setInstrucoes: set } = useStore();
  return (<>
    <PageHeader title="Atendente virtual" desc="Diga como o seu atendente deve se comportar com os clientes." action={<Btn onClick={() => toast.success("Configurações salvas!")}>Salvar</Btn>} />
    <div className="grid max-w-3xl gap-4">
      <Card className="space-y-4"><Field label="Nome do atendente"><Input value={i.nomeAtendente} onChange={(e) => set({ ...i, nomeAtendente: e.target.value })} /></Field>
        <div><span className="text-sm font-medium">Tom de voz</span><div className="mt-2 grid gap-2 sm:grid-cols-3">{tons.map((t) => (
          <button key={t.v} onClick={() => set({ ...i, tom: t.v })} className={cn("rounded-xl border-2 p-3 text-left transition-colors", i.tom === t.v ? "border-primary bg-accent" : "hover:bg-muted")}>
            <p className="font-semibold">{t.l}</p><p className="text-xs text-muted-foreground">{t.d}</p></button>))}</div></div></Card>
      <Card className="space-y-4">
        <Field label="Mensagem de boas-vindas"><Textarea value={i.boasVindas} onChange={(e) => set({ ...i, boasVindas: e.target.value })} /></Field>
        <Field label="Instruções e regras"><Textarea className="min-h-36" value={i.regras} onChange={(e) => set({ ...i, regras: e.target.value })} /></Field>
        <p className="text-xs text-muted-foreground">Dica: escreva como se estivesse explicando para um novo funcionário.</p></Card>
      <Card className="flex items-center justify-between gap-4"><div><p className="font-semibold">Transferir para um humano</p><p className="text-sm text-muted-foreground">Quando não souber responder, o atendente chama alguém da equipe.</p></div>
        <Toggle label="Transferir para humano" on={i.transferirHumano} onChange={(v) => set({ ...i, transferirHumano: v })} /></Card>
    </div>
    <QuickAccess />
  </>);
}
