import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, CheckCircle2, Cloud, MessageCircle, Plug, ShieldCheck, Workflow } from "lucide-react";
import { toast } from "sonner";
import { Card, PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/integracoes")({
  head: () => ({ meta: [{ title: "Integrações — Zyon Chat" }, { name: "description", content: "Acompanhe e configure as integrações do seu atendimento." }] }),
  component: Integracoes,
});

const items = [
  { id: "whatsapp", name: "WhatsApp Business", description: "Receba e responda mensagens dos clientes pelo canal oficial do WhatsApp.", icon: MessageCircle, status: "Configuração necessária", detail: "Será necessário configurar a plataforma oficial da Meta e vincular um número comercial." },
  { id: "google", name: "Login com Google", description: "Permita que os usuários acessem o painel usando a conta Google.", icon: ShieldCheck, status: "Em configuração", detail: "O provedor OAuth ainda precisa ser configurado no Google Cloud e no Supabase." },
  { id: "supabase", name: "Supabase", description: "Banco de dados, autenticação e armazenamento das informações do sistema.", icon: Cloud, status: "Conectado ao projeto", detail: "A conexão do projeto foi iniciada no Lovable. Ainda precisamos validar autenticação e persistência dos dados." },
  { id: "n8n", name: "n8n Automations", description: "Automatize tarefas e conecte o atendimento a outros serviços.", icon: Workflow, status: "Não conectado", detail: "A integração depende de uma instância n8n e da configuração segura dos webhooks." },
];

function Integracoes() {
  const [details, setDetails] = useState<string | null>(null);
  const selected = items.find((item) => item.id === details);
  return (
    <div className="space-y-6">
      <PageHeader title="Integrações" desc="Centralize os serviços que ampliam o atendimento do Zyon Chat." />
      <Card className="border-emerald-400/20 bg-emerald-500/[0.06]">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-500/15 p-3 text-emerald-300"><Plug className="h-5 w-5" /></div>
          <div><h2 className="font-semibold">Conecte seus canais e ferramentas</h2><p className="mt-1 text-sm text-muted-foreground">Veja o que já foi iniciado e o que ainda precisa de configuração. Nenhuma integração será marcada como ativa sem uma conexão real.</p></div>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map(({ id, name, description, icon: Icon, status }) => (
          <Card key={id} className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3"><div className="rounded-xl bg-muted p-3"><Icon className="h-5 w-5" /></div><div><h3 className="font-semibold">{name}</h3><p className="mt-1 text-xs text-muted-foreground">{status}</p></div></div>
              {id === "supabase" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
            </div>
            <p className="mt-4 flex-1 text-sm text-muted-foreground">{description}</p>
            <button onClick={() => setDetails(id)} className="mt-5 rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted">Ver detalhes</button>
          </Card>
        ))}
      </div>
      {selected && <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detalhes da integração</p><h3 className="mt-1 text-lg font-bold">{selected.name}</h3></div><button onClick={() => setDetails(null)} className="text-sm text-muted-foreground hover:text-foreground">Fechar</button></div>
        <p className="mt-3 text-sm text-muted-foreground">{selected.detail}</p>
        <p className="mt-3 text-xs text-muted-foreground">Status atual: {selected.status}. Esta tela não envia credenciais nem ativa serviços externos.</p>
      </div>}
    </div>
  );
}
