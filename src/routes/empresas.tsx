import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Phone, MapPin } from "lucide-react";
import { Btn, Card, Field, Input, Modal, PageHeader, Toggle } from "@/components/app/ui";
import { novoId, useStore } from "@/lib/store";
import type { Empresa } from "@/lib/types";

export const Route = createFileRoute("/empresas")({
  head: () => ({ meta: [{ title: "Empresas — Zyon Desk" }, { name: "description", content: "Cadastre e gerencie as empresas atendidas pela IA." }, { property: "og:title", content: "Empresas — Zyon Desk" }, { property: "og:description", content: "Cadastre e gerencie as empresas atendidas pela IA." }] }),
  component: Empresas,
});
const vazio: Empresa = { id: "", nome: "", segmento: "", telefone: "", cidade: "", ativa: true };
function Empresas() {
  const { empresas, setEmpresas } = useStore();
  const [form, setForm] = useState<Empresa | null>(null);
  const salvar = () => { if (!form?.nome) return;
    setEmpresas(form.id ? empresas.map((e) => (e.id === form.id ? form : e)) : [...empresas, { ...form, id: novoId() }]); setForm(null); };
  return (<>
    <PageHeader title="Empresas" desc="As lojas e negócios que usam o atendente virtual." action={<Btn onClick={() => setForm(vazio)}><Plus className="h-4 w-4" />Nova empresa</Btn>} />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {empresas.map((e) => (<Card key={e.id}>
        <div className="flex items-start justify-between gap-2"><div><h3 className="font-display text-lg font-bold">{e.nome}</h3><p className="text-sm text-muted-foreground">{e.segmento}</p></div>
          <Toggle label="Ativa" on={e.ativa} onChange={(v) => setEmpresas(empresas.map((x) => x.id === e.id ? { ...x, ativa: v } : x))} /></div>
        <div className="mt-4 space-y-1 text-sm text-muted-foreground"><p className="flex items-center gap-2"><Phone className="h-4 w-4" />{e.telefone}</p><p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{e.cidade}</p></div>
        <div className="mt-4 flex gap-2"><Btn variant="ghost" onClick={() => setForm(e)}><Pencil className="h-4 w-4" />Editar</Btn>
          <Btn variant="danger" onClick={() => setEmpresas(empresas.filter((x) => x.id !== e.id))}><Trash2 className="h-4 w-4" />Excluir</Btn></div>
      </Card>))}
    </div>
    <Modal open={!!form} title={form?.id ? "Editar empresa" : "Nova empresa"} onClose={() => setForm(null)}>
      {form && <div className="space-y-4">
        <Field label="Nome da empresa"><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></Field>
        <Field label="Segmento"><Input placeholder="Ex.: Alimentação" value={form.segmento} onChange={(e) => setForm({ ...form, segmento: e.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="WhatsApp"><Input placeholder="(00) 00000-0000" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></Field>
          <Field label="Cidade"><Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></Field></div>
        <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => setForm(null)}>Cancelar</Btn><Btn onClick={salvar}>Salvar</Btn></div>
      </div>}
    </Modal>
  </>);
}
