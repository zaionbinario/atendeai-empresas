import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Building2, CheckCircle2, Clock3, ShieldCheck, ArrowRight, Store } from "lucide-react";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/auth-client";

export const Route = createFileRoute("/empresas")({
  head: () => ({ meta: [{ title: "Minhas empresas — Zyon Chat" }] }),
  component: MinhaEmpresa,
});

type EmpresaVinculada = { id: string; nome: string; status: string };

function MinhaEmpresa() {
  const [nome, setNome] = useState("");
  const { empresaSelecionadaId, setEmpresaSelecionadaId } = useStore();
  const [empresas, setEmpresas] = useState<EmpresaVinculada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function carregar() {
    if (!supabase) { setErro("Supabase não configurado."); setCarregando(false); return; }
    setCarregando(true);
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) {
      setErro("Entre na sua conta para cadastrar uma empresa.");
      setCarregando(false);
      return;
    }
    const { data: vinculos, error: vinculoErro } = await supabase
      .from("empresa_usuarios").select("empresa_id").eq("usuario_id", auth.user.id);
    if (vinculoErro) { setErro("Não foi possível consultar seus vínculos: " + vinculoErro.message); setCarregando(false); return; }
    const ids = (vinculos ?? []).map((v) => v.empresa_id);
    if (ids.length) {
      const { data, error } = await supabase.from("empresas").select("id,nome,status").in("id", ids);
      if (error) setErro("Não foi possível carregar suas empresas: " + error.message);
      else setEmpresas((data ?? []) as EmpresaVinculada[]);
    } else setEmpresas([]);
    setCarregando(false);
  }

  useEffect(() => { void carregar(); }, []);

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || enviando) return;
    const valor = nome.trim();
    if (valor.length < 3 || valor.length > 120) { setErro("O nome deve ter entre 3 e 120 caracteres."); return; }
    setErro(""); setSucesso(""); setEnviando(true);
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Sua sessão expirou. Entre novamente.");
      const { error } = await supabase.rpc("cadastrar_minha_empresa", { p_nome: valor });
      if (error) throw error;
      setNome("");
      setSucesso("Empresa enviada! Seu cadastro está pendente de aprovação.");
      await carregar();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível cadastrar sua empresa.");
    } finally { setEnviando(false); }
  }

  return <div className="mx-auto max-w-3xl space-y-6">
    <div>
      <h1 className="flex items-center gap-3 text-2xl font-bold"><Building2 className="h-7 w-7 text-primary" /> Minhas empresas</h1>
      <p className="mt-2 text-sm text-muted-foreground">Escolha qual negócio deseja administrar ou cadastre uma nova empresa no Zyon Chat.</p>
    </div>
    <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
      <div className="flex items-center gap-2"><Store className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Selecionar empresa</h2></div>
      <p className="mt-2 text-sm text-muted-foreground">Selecione uma empresa ativa para gerenciar seus produtos, horários, perguntas frequentes e testar o simulador. Os dados de cada negócio são separados.</p>
      {carregando ? <p className="mt-4 text-sm text-muted-foreground">Carregando empresas...</p> : empresas.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Você ainda não possui empresas cadastradas.</p> :
        <div className="mt-5 grid gap-4 sm:grid-cols-2">{empresas.map((empresa) => {
          const ativa = empresa.status === "ativa";
          const selecionada = ativa && empresaSelecionadaId === empresa.id;
          return <article key={empresa.id} className={`flex flex-col gap-4 rounded-2xl border p-5 transition-colors ${selecionada ? "border-emerald-500/60 bg-emerald-500/5" : "border-border bg-background"}`}>
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Building2 className="h-6 w-6" /></span>
              <div className="min-w-0"><h3 className="break-words font-semibold">{empresa.nome}</h3><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">{ativa ? <ShieldCheck className="h-4 w-4 text-emerald-400" /> : <Clock3 className="h-4 w-4 text-amber-400" />}{ativa ? "Empresa ativa" : empresa.status === "pendente" ? "Aguardando aprovação" : "Empresa suspensa"}</p></div>
            </div>
            <div className="mt-auto">
              {selecionada ? <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400"><CheckCircle2 className="h-4 w-4" />Empresa selecionada</div> :
                <button type="button" disabled={!ativa} onClick={() => setEmpresaSelecionadaId(empresa.id)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">{ativa ? <>Usar esta empresa <ArrowRight className="h-4 w-4" /></> : "Indisponível para seleção"}</button>}
              {selecionada && <Link to="/" className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline">Ir para o painel <ArrowRight className="h-4 w-4" /></Link>}
            </div>
          </article>;
        })}</div>}
    </section>
    <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
      <h2 className="text-lg font-semibold">Cadastrar nova empresa</h2>
      <p className="mt-1 text-sm text-muted-foreground">Após o envio, o administrador analisará o cadastro. Você será registrado como dono da empresa.</p>
      <form onSubmit={cadastrar} className="mt-5 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Nome da empresa</span>
          <input className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} minLength={3} required placeholder="Ex.: Barbearia Central" disabled={enviando} />
        </label>
        {erro && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{erro}</p>}
        {sucesso && <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400"><CheckCircle2 className="h-4 w-4" />{sucesso}</p>}
        <button type="submit" disabled={enviando || carregando} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">{enviando ? "Enviando..." : "Enviar para aprovação"}</button>
      </form>
    </section>
    <p className="text-xs text-muted-foreground">Empresas pendentes ou suspensas não podem ser selecionadas. <Link to="/" className="underline">Voltar ao painel</Link></p>
  </div>;
}
