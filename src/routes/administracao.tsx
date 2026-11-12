import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Building2, CheckCircle2, CirclePause, Pencil, Plus, Search, ShieldAlert, ShieldCheck, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Btn, Card, Field, Input, Modal, PageHeader, Toggle } from "@/components/app/ui";
import { novoId, useStore } from "@/lib/store";
import { AdminAccessGate } from "@/components/app/AdminAccessGate";
import { dadosEmpresaValidos, filtrarEmpresas, resumoEmpresas, type FiltroStatusEmpresa } from "@/lib/gestao-empresas";
import type { Empresa } from "@/lib/types";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/administracao")({
  head: () => ({ meta: [{ title: "Administração de empresas — Zyon Chat" }, { name: "description", content: "Gerencie cadastros e status das empresas do Zyon Chat." }] }),
  component: Administracao,
});

const novaEmpresa = (): Empresa => ({ id: "", nome: "", segmento: "", telefone: "", cidade: "", ativa: true });

function Administracao() {
  return (
    <AdminAccessGate>
      <PainelAdministracao />
    </AdminAccessGate>
  );
}

function PainelAdministracao() {
  const { empresas, setEmpresas } = useStore();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroStatusEmpresa>("todas");
  const [form, setForm] = useState<Empresa | null>(null);
  const [limite, setLimite] = useState(20);

  const resumo = resumoEmpresas(empresas);
  const filtradas = filtrarEmpresas(empresas, busca, filtro);
  const visiveis = filtradas.slice(0, limite);

  const abrirEdicao = (empresa: Empresa) => setForm({ ...empresa });
  const salvar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form || !dadosEmpresaValidos(form)) {
      toast.error("Informe o nome da empresa.");
      return;
    }
    const dados: Empresa = {
      ...form,
      nome: form.nome.trim(),
      segmento: form.segmento.trim(),
      cidade: form.cidade.trim(),
      telefone: form.telefone.trim(),
    };
    const nomeRepetido = empresas.some((empresa) =>
      empresa.id !== dados.id && empresa.nome.toLocaleLowerCase("pt-BR") === dados.nome.toLocaleLowerCase("pt-BR")
    );
    if (nomeRepetido) {
      toast.error("Já existe uma empresa cadastrada com esse nome.");
      return;
    }

    setEmpresas((atuais) => dados.id
      ? atuais.map((empresa) => empresa.id === dados.id ? dados : empresa)
      : [...atuais, { ...dados, id: novoId() }]
    );
    toast.success(dados.id ? "Cadastro atualizado neste navegador." : "Empresa cadastrada neste navegador.");
    setForm(null);
  };

  const mudarStatus = (id: string, ativa: boolean) => {
    setEmpresas((atuais) => atuais.map((empresa) => empresa.id === id ? { ...empresa, ativa } : empresa));
    toast.success(ativa ? "Empresa ativada." : "Empresa desativada.");
  };

  const excluir = (id: string, nome: string) => {
    setEmpresas((atuais) => atuais.filter((empresa) => empresa.id !== id));
    toast.success(`Cadastro de ${nome} excluído neste navegador.`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Administração de empresas"
        desc="Acompanhe e gerencie os cadastros dos negócios no Zyon Chat."
        action={<Btn type="button" onClick={() => setForm(novaEmpresa())}><Plus className="h-4 w-4" /> Cadastrar empresa</Btn>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center justify-between gap-2">
          <div><p className="text-sm text-muted-foreground">Empresas cadastradas</p><p className="mt-1 text-3xl font-bold">{resumo.total}</p></div>
          <Users className="h-7 w-7 text-muted-foreground" />
        </Card>
        <Card className="flex items-center justify-between gap-2">
          <div><p className="text-sm text-muted-foreground">Empresas ativas</p><p className="mt-1 text-3xl font-bold">{resumo.ativas}</p></div>
          <CheckCircle2 className="h-7 w-7 text-emerald-500" />
        </Card>
        <Card className="flex items-center justify-between gap-2">
          <div><p className="text-sm text-muted-foreground">Empresas inativas</p><p className="mt-1 text-3xl font-bold">{resumo.inativas}</p></div>
          <CirclePause className="h-7 w-7 text-amber-500" />
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Building2 className="h-5 w-5 text-primary" /> Empresas cadastradas</h2>
            <p className="text-xs text-muted-foreground">Altere os dados, ative ou desative empresas e exclua cadastros quando necessário.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px]">
          <label className="relative block">
            <span className="sr-only">Buscar empresas</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busca}
              onChange={(event) => { setBusca(event.target.value); setLimite(20); }}
              placeholder="Buscar por nome, segmento, cidade ou telefone"
              className="h-11 w-full rounded-xl border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="sr-only">Filtrar status das empresas</span>
            <select
              value={filtro}
              onChange={(event) => { setFiltro(event.target.value as FiltroStatusEmpresa); setLimite(20); }}
              className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
            >
              <option value="todas">Todas</option>
              <option value="ativas">Ativas</option>
              <option value="inativas">Inativas</option>
            </select>
          </label>
        </div>
        <p className="text-xs text-muted-foreground">{filtradas.length} {filtradas.length === 1 ? "empresa encontrada" : "empresas encontradas"}</p>

        {filtradas.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhuma empresa encontrada. Ajuste os filtros ou cadastre uma nova empresa.
          </div>
        ) : (
          <div className="space-y-3">
            {visiveis.map((empresa) => (
              <div key={empresa.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{empresa.nome}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {empresa.segmento || "Segmento não informado"} · {empresa.cidade || "Cidade não informada"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{empresa.telefone || "WhatsApp não informado"}</p>
                  </div>
                  <span className={empresa.ativa ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600" : "rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600"}>
                    {empresa.ativa ? "Ativa" : "Inativa"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                  <Toggle on={empresa.ativa} onChange={(ativa) => mudarStatus(empresa.id, ativa)} label={`Ativar ou desativar ${empresa.nome}`} />
                  <div className="flex flex-wrap items-center gap-2">
                    <Btn type="button" variant="ghost" onClick={() => abrirEdicao(empresa)}><Pencil className="h-4 w-4" /> Editar</Btn>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Btn type="button" variant="danger"><Trash2 className="h-4 w-4" /> Excluir</Btn>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir a empresa {empresa.nome}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            O cadastro será excluído deste navegador. Essa ação não apaga conversas ou
                            informações do WhatsApp e não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => excluir(empresa.id, empresa.nome)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Sim, excluir empresa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
            {filtradas.length > limite && (
              <div className="text-center">
                <Btn type="button" variant="ghost" onClick={() => setLimite((n) => n + 20)}>
                  Mostrar mais {Math.min(20, filtradas.length - limite)} empresas
                </Btn>
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-500/5 p-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Administração em demonstração.</strong> Os cadastros são salvos apenas neste navegador.
          A senha desta página funciona somente neste navegador e não substitui autenticação no servidor.
          Antes de disponibilizar a clientes, será necessário configurar login, permissões e dados separados por empresa.
        </p>
      </div>

      <Modal open={form !== null} title={form?.id ? "Editar empresa" : "Cadastrar empresa"} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={salvar} className="space-y-4">
            <Field label="Nome da empresa">
              <Input value={form.nome} maxLength={120} onChange={(event) => setForm({ ...form, nome: event.target.value })} required />
            </Field>
            <Field label="Segmento">
              <Input value={form.segmento} maxLength={100} placeholder="Ex.: Alimentação" onChange={(event) => setForm({ ...form, segmento: event.target.value })} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="WhatsApp">
                <Input type="tel" value={form.telefone} maxLength={30} placeholder="(00) 00000-0000" onChange={(event) => setForm({ ...form, telefone: event.target.value })} />
              </Field>
              <Field label="Cidade">
                <Input value={form.cidade} maxLength={120} onChange={(event) => setForm({ ...form, cidade: event.target.value })} />
              </Field>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/40 p-3">
              <span className="text-sm font-medium">Empresa ativa</span>
              <Toggle on={form.ativa} onChange={(ativa) => setForm({ ...form, ativa })} label="Status da empresa" />
            </div>
            <div className="flex justify-end gap-2">
              <Btn type="button" variant="ghost" onClick={() => setForm(null)}>Cancelar</Btn>
              <Btn type="submit"><ShieldCheck className="h-4 w-4" /> Salvar empresa</Btn>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
