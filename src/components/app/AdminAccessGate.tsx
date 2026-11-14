import { useEffect, useState, type ReactNode } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Btn, Card, PageHeader } from "@/components/app/ui";
import { supabase } from "@/lib/auth-client";

export function AdminAccessGate({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<"carregando" | "login" | "negado" | "autorizado" | "erro">("carregando");

  useEffect(() => {
    let ativo = true;
    let revisao = 0;
    const verificar = async () => {
      const atual = ++revisao;
      if (!supabase) { if (ativo) setEstado("erro"); return; }
      setEstado("carregando");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!ativo || atual !== revisao) return;
      if (authError || !user) { setEstado("login"); return; }
      const { data, error } = await supabase
        .from("admins_plataforma")
        .select("usuario_id")
        .eq("usuario_id", user.id)
        .maybeSingle();
      if (!ativo || atual !== revisao) return;
      setEstado(error ? "erro" : data ? "autorizado" : "negado");
    };
    void verificar();
    const { data: { subscription } } = supabase?.auth.onAuthStateChange(() => {
      // Defer the query until the auth callback finishes to avoid auth-client lock contention.
      setTimeout(() => { if (ativo) void verificar(); }, 0);
    }) ?? { data: { subscription: null } };
    return () => { ativo = false; revisao++; subscription?.unsubscribe(); };
  }, []);

  if (estado !== "autorizado") {
    return (
      <div className="mx-auto w-full max-w-xl space-y-5">
        <PageHeader title="Administração" desc="Acesso exclusivo para administradores autorizados no Supabase." />
        <Card className="space-y-4 text-center">
          <LockKeyhole className="mx-auto h-9 w-9 text-primary" />
          <p className="text-sm text-muted-foreground" role="status">
            {estado === "carregando" && "Verificando sua conta e permissões..."}
            {estado === "login" && "Entre na sua conta do Zyon Chat para acessar a administração."}
            {estado === "negado" && "Sua conta não tem permissão de administrador da plataforma."}
            {estado === "erro" && "Não foi possível verificar a permissão. Confira a conexão e as políticas RLS da tabela admins_plataforma."}
          </p>
          {estado === "login" && <Btn type="button" onClick={() => { window.location.href = "/login"; }}>Ir para login</Btn>}
          {estado === "erro" && <Btn type="button" onClick={() => window.location.reload()}>Tentar novamente</Btn>}
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-semibold">
        <ShieldCheck className="h-4 w-4 text-emerald-500" /> Administrador autenticado e autorizado pelo Supabase
      </div>
      {children}
    </div>
  );
}
