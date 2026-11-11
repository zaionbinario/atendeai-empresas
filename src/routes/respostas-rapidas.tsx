import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { Btn, Card, Field, Input, PageHeader } from "@/components/app/ui";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/respostas-rapidas")({
  head: () => ({ meta: [{ title: "Respostas rápidas — Zyon Chat" }] }),
  component: RespostasRapidas,
});
function RespostasRapidas() {
  const { respostasRapidas, setRespostasRapidas } = useStore();
  const [nova, setNova] = useState("");
  const adicionar = () => {
    if (!nova.trim()) return;
    setRespostasRapidas([...respostasRapidas, nova.trim()]);
    setNova(""); toast.success("Resposta rápida cadastrada!");
  };
  return (<>
    <PageHeader title="Respostas rápidas" desc="Cadastre mensagens prontas para agilizar o atendimento." />
    <Card className="mb-4 space-y-3">
      <Field label="Nova resposta"><Input value={nova} onChange={(e) => setNova(e.target.value)} placeholder="Digite a mensagem que deseja salvar..." /></Field>
      <div className="flex justify-end"><Btn onClick={adicionar} disabled={!nova.trim()}><Plus className="h-4 w-4" /> Adicionar resposta</Btn></div>
    </Card>
    <Card className="space-y-2">
      <h2 className="font-semibold">Mensagens cadastradas ({respostasRapidas.length})</h2>
      {respostasRapidas.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma resposta cadastrada.</p> : respostasRapidas.map((r, i) => <div key={i} className="flex items-center gap-3 rounded-xl border p-3"><MessageSquareText className="h-5 w-5 shrink-0 text-primary" /><p className="flex-1 text-sm">{r}</p><button aria-label="Excluir resposta" onClick={() => { setRespostasRapidas(respostasRapidas.filter((_, j) => j !== i)); toast.success("Resposta removida."); }} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button></div>)}
    </Card>
  </>);
}
