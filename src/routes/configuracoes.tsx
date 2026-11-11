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
          <div className="flex items-center gap-3"><div className="rounded-xl bg-muted p-3"><SlidersHorizontal className="h-5 w-5" /></div><div><h2 className="font-semibold">Preferências do atendimento</h2><p className="text-sm text-muted-foreground">Personalize o comportamento do atendimento e os avisos do painel.</p></div></div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0"><p className="text-sm font-medium">Respostas automáticas</p><p className="mt-1 text-xs text-muted-foreground">Define se o atendimento poderá responder automaticamente às mensagens dos clientes.</p></div>
            <Toggle label="Respostas automáticas" on={prefs.respostasAutomaticas} onChange={(v) => update({ respostasAutomaticas: v })} />
          </div>
          <div className="border-t border-border" />
          <div className="flex items-center gap-3"><Bell className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Notificações</span></div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0"><p className="text-sm font-medium">Notificações gerais</p><p className="mt-1 text-xs text-muted-foreground">Ativa ou desativa avisos gerais e atualizações importantes do painel.</p></div>
            <Toggle label="Notificações gerais" on={prefs.notificacoes} onChange={(v) => update({ notificacoes: v })} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0"><p className="text-sm font-medium">Avisos de novas conversas</p><p className="mt-1 text-xs text-muted-foreground">Mostra um aviso quando um cliente iniciar uma nova conversa.</p></div>
            <Toggle label="Avisos de novas conversas" on={prefs.avisosAtendimento} onChange={(v) => update({ avisosAtendimento: v })} />
          </div>
        </Card>
      </div>
      <Card className="border-amber-400/20 bg-amber-500/[0.05]">
        <div className="flex items-start gap-3"><Shield className="mt-0.5 h-5 w-5 text-amber-500" /><div><h3 className="font-semibold">Sobre o salvamento</h3><p className="mt-1 text-sm text-muted-foreground">Por enquanto, estas opções são salvas apenas neste navegador e servem como preferências do painel. Elas ainda não ativam o envio real de respostas automáticas nem o disparo de notificações. A integração dessas funções será feita nas próximas etapas.</p></div></div>
      </Card>
    </div>
  );
}
