import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Building2, RotateCcw, Save, Shield, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Btn, Card, Field, Input, PageHeader, Toggle } from "@/components/app/ui";
import { useStore } from "@/lib/store";
import { AppearanceSettings } from "@/components/app/AppearanceSettings";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Zyon Chat" }, { name: "description", content: "Personalize as preferências do painel e do atendimento." }] }),
  component: Configuracoes,
});

type Preferences = { nome: string; email: string; notificacoes: boolean; avisosAtendimento: boolean; respostasAutomaticas: boolean };
const defaults: Preferences = { nome: "Minha empresa", email: "", notificacoes: true, avisosAtendimento: true, respostasAutomaticas: true };

function Configuracoes() {
  const { botAtivo, setBotAtivo, zerarIndicadores, empresas } = useStore();
  const [prefs, setPrefs] = useState<Preferences>(defaults);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("zyon-chat-preferencias");
      if (saved) setPrefs({ ...defaults, ...JSON.parse(saved) as Partial<Preferences> });
    } catch { /* Mantém as preferências padrão se o armazenamento estiver indisponível. */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (empresas[0]) setPrefs(current => ({ ...current, nome: empresas[0].nome })); }, [empresas]);
  // O botão do cabeçalho, o painel e o Simulador usam este mesmo estado.
  useEffect(() => {
    setPrefs((current) => current.respostasAutomaticas === botAtivo ? current : { ...current, respostasAutomaticas: botAtivo });
  }, [botAtivo]);
  const update = (patch: Partial<Preferences>) => setPrefs((current) => ({ ...current, ...patch }));
  const save = () => {
    try {
      localStorage.setItem("zyon-chat-preferencias", JSON.stringify(prefs));
      setBotAtivo(prefs.respostasAutomaticas);
      toast.success("Preferências salvas neste navegador.");
    } catch {
      toast.error("Não foi possível salvar neste navegador.");
    }
  };
  const confirmarReset = () => {
    try {
      zerarIndicadores();
      toast.success("Indicadores zerados! O histórico de conversas foi mantido.");
    } catch {
      toast.error("Não foi possível salvar o reset neste navegador.");
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" desc="Ajuste as informações básicas e as preferências do seu painel." action={<Btn onClick={save} disabled={!loaded}><Save className="h-4 w-4" />Salvar alterações</Btn>} />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-5">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-muted p-3"><Building2 className="h-5 w-5" /></div><div><h2 className="font-semibold">Informações do negócio</h2><p className="text-sm text-muted-foreground">Dados básicos exibidos nas configurações.</p></div></div>
          <Field label="Nome do negócio"><Input value={empresas[0]?.nome ?? prefs.nome} readOnly placeholder="Nome da sua empresa" /></Field>
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
      <AppearanceSettings />
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex max-w-lg items-start gap-3">
            <div className="rounded-xl bg-muted p-3"><RotateCcw className="h-5 w-5" /></div>
            <div>
              <h2 className="font-semibold">Zerar indicadores do painel</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Zere manualmente as contagens de conversas, clientes e atendimentos pela IA ou por humanos.
                O histórico de mensagens, o status do bot e as demais configurações não serão apagados.
              </p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Btn type="button" variant="danger"><RotateCcw className="h-4 w-4" /> Zerar contadores</Btn>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deseja realmente zerar os contadores?</AlertDialogTitle>
                <AlertDialogDescription>
                  Os indicadores de conversas, clientes atendidos e atendimentos por IA ou humanos
                  voltarão a zero. Novos atendimentos serão contados a partir deste momento.
                  Nenhuma conversa antiga será excluída.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmarReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Sim, zerar contadores
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
      <Card className="border-amber-400/20 bg-amber-500/[0.05]">
        <div className="flex items-start gap-3"><Shield className="mt-0.5 h-5 w-5 text-amber-500" /><div><h3 className="font-semibold">Sobre o salvamento</h3><p className="mt-1 text-sm text-muted-foreground">Por enquanto, as preferências são salvas apenas neste navegador. Respostas automáticas controla o status do bot no painel e seu comportamento no Simulador, mas ainda não envia mensagens reais a clientes. As notificações de atendimentos e atualizações aparecem no sino dentro deste navegador; ainda não há notificações push, sincronização entre dispositivos ou envios pelo WhatsApp.</p></div></div>
      </Card>
    </div>
  );
}
