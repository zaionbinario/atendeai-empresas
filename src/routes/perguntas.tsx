import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Btn, Card, Field, Input, Modal, PageHeader, QuickAccess, Textarea } from "@/components/app/ui";
import { novoId, useStore } from "@/lib/store";
import type { Faq } from "@/lib/types";

export const Route = createFileRoute("/perguntas")({
  head: () => ({ meta: [{ title: "Perguntas frequentes — Zyon Chat" }, { name: "description", content: "Cadastre perguntas e respostas para o atendente virtual." }, { property: "og:title", content: "Perguntas frequentes — Zyon Chat" }, { property: "og:description", content: "Cadastre perguntas e respostas para o atendente virtual." }] }),
  component: Perguntas,
});
function Perguntas() {
  const { faqs, salvarFaqs } = useStore();
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<Faq | null>(null);
  const salvar = async () => {
    if (!form?.pergunta.trim() || !form.resposta.trim() || salvando) return;
    setSalvando(true);
    try {
      const ok = await salvarFaqs(form.id ? faqs.map((f) => f.id === form.id ? form : f) : [...faqs, { ...form, id: novoId() }]);
      if (ok) setForm(null);
    } finally { setSalvando(false); }
  };
  const excluir = async (id: string) => {
    if (salvando) return;
    setSalvando(true);
    try { await salvarFaqs(faqs.filter((f) => f.id !== id)); }
    finally { setSalvando(false); }
  };
  return (<>
    <PageHeader title="Perguntas frequentes" desc="Ensine o atendente a responder as dúvidas mais comuns." action={<Btn onClick={() => setForm({ id: "", pergunta: "", resposta: "" })}><Plus className="h-4 w-4" />Nova pergunta</Btn>} />
    <div className="grid max-w-3xl gap-3">{faqs.map((f) => (
      <Card key={f.id}><div className="flex gap-3"><div className="flex-1"><p className="font-semibold">❓ {f.pergunta}</p><p className="mt-2 text-muted-foreground">💬 {f.resposta}</p></div>
        <div className="flex gap-1"><Btn variant="ghost" aria-label="Editar" onClick={() => setForm(f)}><Pencil className="h-4 w-4" /></Btn>
          <Btn variant="danger" aria-label="Excluir" onClick={() => void excluir(f.id)} disabled={salvando}><Trash2 className="h-4 w-4" /></Btn></div></div></Card>))}
    </div>
    <QuickAccess />
    <Modal open={!!form} title={form?.id ? "Editar pergunta" : "Nova pergunta"} onClose={() => setForm(null)}>
      {form && <div className="space-y-4">
        <Field label="Pergunta do cliente"><Input value={form.pergunta} onChange={(e) => setForm({ ...form, pergunta: e.target.value })} /></Field>
        <Field label="Resposta do atendente"><Textarea value={form.resposta} onChange={(e) => setForm({ ...form, resposta: e.target.value })} /></Field>
        <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => setForm(null)}>Cancelar</Btn><Btn onClick={() => void salvar()} disabled={salvando || !form.pergunta.trim() || !form.resposta.trim()}>{salvando ? "Salvando..." : "Salvar"}</Btn></div>
      </div>}
    </Modal>
  </>);
}
