import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Building2, Save, Shield, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Btn, Card, Field, Input, PageHeader, Toggle } from "@/components/app/ui";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Zyon Chat" }, { name: "description", content: "Personalize as preferências do painel e do atendimento." }] }),
  component: Configuracoes,
});

type Preferences = { nome: string; email: string; notificacoes: boolean; avisosAtendimento: boolean; respostasAutomaticas: boolean };
const defaults: Preferences = { nome: "Minha empresa", email: "", notificacoes: true, avisosAtendimento: true, respostasAutomaticas: true };

function Configuracoes() {
  const [prefs, setPrefs] = useState<Preferences>(defaults);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("zyon-chat-preferencias");
      if (saved) setPrefs({ ...defaults, ...JSON.parse(saved) as Partial<Preferences> });
    } catch { /* Mantém as preferências padrão se o armazenamento estiver indisponível. */ }
    setLoaded(true);
  }, []);
  const update = (patch: Partial<Preferences>) => setPrefs((current) => ({ ...current, ...patch }));
  const save = () => {
    try {
      localStorage.setItem("zyon-chat-preferencias", JSON.stringify(prefs));
      toast.success("Preferências salvas neste navegador.");
    } catch {
      toast.error("Não foi possível salvar neste navegador.");
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" desc="Ajuste as informações básicas e as preferências do seu painel." action={<Btn onClick={save} disabled={!loaded}><Save className="h-4 w-4" />Salvar alterações</Btn>} />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-5">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-muted p-3"><Building2 className="h-5 w-5" /></div><div><h2 className="font-semibold">Informações do negócio</h2><p className="text-sm text-muted-foreground">Dados básicos exibidos nas configurações.</p></div></div>
          <Field label="Nome do negócio"><Input value={prefs.nome} onChange={(e) => update({ nome: e.target.value })} placeholder="Nome da sua empresa" /></Field>
          <Field label="E-mail de contato"><Input type="email" value={prefs.email} onChange={(e) => update({ email: e.target.value })} placeholder="contato@empresa.com" /></Field>
        </Card>
        <Card className="space-y-5">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-muted p-3"><SlidersHorizontal className="h-5 w-5" /></div><div><h2 className="font-semibold">Preferências do atendimento</h2><p className="text-sm text-muted-foreground">Controles locais de demonstração.</p></div></div>
          <Toggle label="Respostas automáticas habilitadas" on={prefs.respostasAutomaticas} onChange={(v) => update({ respostasAutomaticas: v })} />
          <div className="border-t border-border" />
          <div className="flex items-center gap-3"><Bell className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Notificações</span></div>
          <Toggle label="Notificações gerais" on={prefs.notificacoes} onChange={(v) => update({ notificacoes: v })} />
          <Toggle label="Avisos de novas conversas" on={prefs.avisosAtendimento} onChange={(v) => update({ avisosAtendimento: v })} />
        </Card>
      </div>
      <Card className="border-amber-400/20 bg-amber-500/[0.05]">
        <div className="flex items-start gap-3"><Shield className="mt-0.5 h-5 w-5 text-amber-500" /><div><h3 className="font-semibold">Sobre o salvamento</h3><p className="mt-1 text-sm text-muted-foreground">Nesta versão, as preferências ficam salvas apenas neste navegador. Para compartilhar configurações entre usuários e dispositivos, será necessário concluir a persistência no Supabase.</p></div></div>
      </Card>
    </div>
  );
}
