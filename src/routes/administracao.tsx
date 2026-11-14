import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, CheckCircle2, Clock3, RefreshCw, Search, ShieldAlert, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Btn, Card, PageHeader } from "@/components/app/ui";
import { AdminAccessGate } from "@/components/app/AdminAccessGate";
import { supabase } from "@/lib/auth-client";

export const Route = createFileRoute("/administracao")({
  head: () => ({ meta: [{ title: "Administração de empresas — Zyon Chat" }] }),
  component: Administracao,
});

type EmpresaAdmin = {
  empresa_id: string;
  empresa_nome: string;
  empresa_status: "pendente" | "ativa" | "suspensa";
  responsavel_nome: string | null;
  responsavel_email: string | null;
};

function Administracao() {
  return <AdminAccessGate><PainelAdministracao /></AdminAccessGate>;
}

function PainelAdministracao() {
  const [empresas, setEmpresas] = useState<EmpresaAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todas");

  const carregar = useCallback(async () => {
    if (!supabase) { setErro("Supabase não configurado."); setCarregando(false); return; }
    setCarregando(true); setErro("");
    const { data, error } = await supabase.rpc("admin_listar_empresas");
    if (error) setErro("Não foi possível consultar as empresas: " + error.message);
    else setEmpresas((data ?? []) as EmpresaAdmin[]);
    setCarregando(false);
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const mudarStatus = async (empresa: EmpresaAdmin, status: "ativa" | "suspensa") => {
    if (!supabase || processando) return;
    const acao = status === "ativa" ? "aprovar/reativar" : "suspender";
    if (!window.confirm(`Deseja ${acao} a empresa "${empresa.empresa_nome}"?`)) return;
    setProcessando(empresa.empresa_id);
    const { error } = await supabase.rpc("admin_alterar_status_empresa", {
      p_empresa_id: empresa.empresa_id,
      p_status: status,
    });
    if (error) { toast.error("Erro ao alterar empresa: " + error.message); setErro(error.message); }
    else { toast.success(status === "ativa" ? "Empresa aprovada!" : "Empresa suspensa."); await carregar(); }
    setProcessando(null);
  };

  const visiveis = useMemo(() => empresas.filter((empresa) => {
    if (filtro !== "todas" && empresa.empresa_status !== filtro) return false;
    const texto = [empresa.empresa_nome, empresa.responsavel_nome, empresa.responsavel_email].join(" ").toLocaleLowerCase("pt-BR");
    return texto.includes(busca.trim().toLocaleLowerCase("pt-BR"));
  }), [empresas, busca, filtro]);

  const totalAtivas = empresas.filter((e) => e.empresa_status === "ativa").length;
  const totalPendentes = empresas.filter((e) => e.empresa_status === "pendente").length;

  return <div className="space-y-5">
    <PageHeader title="Administração de empresas" desc="Aprove ou suspenda empresas cadastradas no Supabase."
      action={<Btn type="button" onClick={() => void carregar()} disabled={carregando}><RefreshCw className="h-4 w-4" /> Atualizar</Btn>} />
    <div className="grid gap-3 sm:grid-cols-3">
      <Card><p className="text-sm text-muted-foreground">Empresas cadastradas</p><p className="mt-1 flex items-center gap-2 text-3xl font-bold"><Users className="h-6 w-6 text-primary" />{empresas.length}</p></Card>
      <Card><p className="text-sm text-muted-foreground">Aguardando aprovação</p><p className="mt-1 flex items-center gap-2 text-3xl font-bold"><Clock3 className="h-6 w-6 text-amber-500" />{totalPendentes}</p></Card>
      <Card><p className="text-sm text-muted-foreground">Empresas ativas</p><p className="mt-1 flex items-center gap-2 text-3xl font-bold"><CheckCircle2 className="h-6 w-6 text-emerald-500" />{totalAtivas}</p></Card>
    </div>
    <Card className="space-y-4">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Building2 className="h-5 w-5 text-primary" /> Empresas do Supabase</h2>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px]">
        <label className="relative block"><span className="sr-only">Buscar empresas</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar empresa, responsável ou e-mail" className="h-11 w-full rounded-xl border bg-background py-2 pl-10 pr-3 text-sm" /></label>
        <select aria-label="Filtrar por status" value={filtro} onChange={(e) => setFiltro(e.target.value)} className="h-11 rounded-xl border bg-background px-3 text-sm"><option value="todas">Todas</option><option value="pendente">Pendentes</option><option value="ativa">Ativas</option><option value="suspensa">Suspensas</option></select>
      </div>
      {erro && <div role="alert" className="flex gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"><ShieldAlert className="h-5 w-5 shrink-0" />{erro}</div>}
      {carregando ? <p className="text-sm text-muted-foreground">Carregando empresas...</p> : visiveis.length === 0 ? <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">Nenhuma empresa encontrada.</p> : <div className="space-y-3">
        {visiveis.map((empresa) => <div key={empresa.empresa_id} className="rounded-xl border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0"><p className="font-semibold">{empresa.empresa_nome}</p><p className="mt-1 text-sm text-muted-foreground">Responsável: {empresa.responsavel_nome || "Nome não informado"}</p><p className="break-all text-xs text-muted-foreground">{empresa.responsavel_email || "E-mail não informado"}</p></div>
            <span className="rounded-full border px-3 py-1 text-xs font-semibold">{empresa.empresa_status === "ativa" ? "Ativa" : empresa.empresa_status === "pendente" ? "Pendente" : "Suspensa"}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
            {empresa.empresa_status !== "ativa" && <Btn type="button" disabled={processando !== null} onClick={() => void mudarStatus(empresa, "ativa")}><ShieldCheck className="h-4 w-4" /> {empresa.empresa_status === "suspensa" ? "Reativar" : "Aprovar"}</Btn>}
            {empresa.empresa_status !== "suspensa" && <Btn type="button" variant="danger" disabled={processando !== null} onClick={() => void mudarStatus(empresa, "suspensa")}>Suspender</Btn>}
          </div>
        </div>)}
      </div>}
    </Card>
    <p className="text-xs text-muted-foreground">Os dados e as alterações são consultados diretamente no Supabase. A liberação do acesso ao painel conforme o status da empresa será implementada separadamente.</p>
  </div>;
}
