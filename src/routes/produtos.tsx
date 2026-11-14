import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Btn, Card, Field, Input, Modal, PageHeader, QuickAccess, Textarea } from "@/components/app/ui";
import { brl, novoId, useStore } from "@/lib/store";
import type { Produto } from "@/lib/types";

export const Route = createFileRoute("/produtos")({
  head: () => ({ meta: [{ title: "Produtos — Zyon Chat" }, { name: "description", content: "Cadastre produtos, preços e descrições para o atendente virtual." }, { property: "og:title", content: "Produtos — Zyon Chat" }, { property: "og:description", content: "Cadastre produtos, preços e descrições para o atendente virtual." }] }),
  component: Produtos,
});
const vazio: Produto = { id: "", nome: "", preco: 0, descricao: "", categoria: "" };
function Produtos() {
  const { produtos, salvarProdutos } = useStore();
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<Produto | null>(null);
  const [precoTexto, setPrecoTexto] = useState("");
  const [erroPreco, setErroPreco] = useState("");
  const abrirFormulario = (produto: Produto) => {
    setForm({ ...produto });
    setErroPreco("");
    setPrecoTexto(produto.id ? produto.preco.toFixed(2).replace(".", ",") : "");
  };
  const [busca, setBusca] = useState("");
  useEffect(() => {
    try {
      const produtoPendente = sessionStorage.getItem("zyon-busca-produto-pendente");
      if (produtoPendente) {
        setBusca(produtoPendente);
        sessionStorage.removeItem("zyon-busca-produto-pendente");
      }
    } catch { /* A página continua acessível sem sessionStorage. */ }
  }, []);
  const lista = produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()));
  const salvar = async () => {
    if (!form?.nome.trim()) return;
    const texto = precoTexto.trim().replace(/^R\$\s*/i, "").replace(/\s/g, "");
    const valido = /^\d+(?:[.,]\d{1,2})?$/.test(texto);
    if (!valido) {
      setErroPreco("Digite um preço válido, como 59,90 ou R$ 59,90.");
      return;
    }
    const preco = Number(texto.replace(",", "."));
    if (!Number.isFinite(preco)) {
      setErroPreco("O preço informado é inválido.");
      return;
    }
    setErroPreco("");
    const produto = { ...form, preco };
    setSalvando(true);
    try {
      const ok = await salvarProdutos(form.id ? produtos.map((p) => (p.id === form.id ? produto : p)) : [...produtos, { ...produto, id: novoId() }]);
      if (ok) setForm(null);
    } finally { setSalvando(false); }
  };
  const excluir = async (id: string) => {
    if (salvando) return;
    setSalvando(true);
    try { await salvarProdutos(produtos.filter((p) => p.id !== id)); }
    finally { setSalvando(false); }
  };
  return (<>
    <PageHeader title="Produtos" desc="O atendente usa estas informações para responder sobre preços." action={<Btn onClick={() => abrirFormulario(vazio)}><Plus className="h-4 w-4" />Novo produto</Btn>} />
    <div className="relative mb-4 max-w-sm"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar produto..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
    <Card className="p-0">
      <ul className="divide-y">{lista.map((p) => (
        <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="flex-1"><div className="flex items-center gap-2"><h3 className="font-semibold">{p.nome}</h3><span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{p.categoria}</span></div>
            <p className="text-sm text-muted-foreground">{p.descricao}</p></div>
          <span className="font-display text-lg font-bold text-primary">{brl(p.preco)}</span>
          <div className="flex gap-1"><Btn variant="ghost" aria-label="Editar" onClick={() => abrirFormulario(p)}><Pencil className="h-4 w-4" /></Btn>
            <Btn variant="danger" aria-label="Excluir" onClick={() => void excluir(p.id)} disabled={salvando}><Trash2 className="h-4 w-4" /></Btn></div>
        </li>))}
        {!lista.length && <li className="p-8 text-center text-muted-foreground">Nenhum produto encontrado.</li>}</ul>
    </Card>
    <QuickAccess />
    <Modal open={!!form} title={form?.id ? "Editar produto" : "Novo produto"} onClose={() => setForm(null)}>
      {form && <div className="space-y-4">
        <Field label="Nome do produto"><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Preço (R$)"><Input type="text" inputMode="decimal" placeholder="Ex.: 59,90" value={precoTexto} onChange={(e) => { setPrecoTexto(e.target.value); setErroPreco(""); }} />{erroPreco && <p role="alert" className="mt-1 text-xs text-red-400">{erroPreco}</p>}</Field>
          <Field label="Categoria"><Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} /></Field></div>
        <Field label="Descrição"><Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></Field>
        <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => setForm(null)}>Cancelar</Btn><Btn onClick={() => void salvar()} disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</Btn></div>
      </div>}
    </Modal>
  </>);
}
