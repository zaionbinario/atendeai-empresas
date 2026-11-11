import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Cloud, MessageCircle, Plug, ShieldCheck, Workflow } from "lucide-react";
import { Card, PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/integracoes")({
  head: () => ({ meta: [{ title: "Integrações — Zyon Chat" }, { name: "description", content: "Gerencie a conexão do WhatsApp da empresa e acompanhe a infraestrutura do AtendeAI." }] }),
  component: Integracoes,
});

const companyIntegration = {
  id: "whatsapp",
  name: "WhatsApp Business",
  description: "Conecte o número comercial da sua empresa para receber mensagens e permitir que o AtendeAI responda seus clientes.",
  icon: MessageCircle,
  status: "Configuração necessária",
  detail: "Cada empresa deverá conectar o próprio número do WhatsApp Business. A ativação dependerá da configuração da plataforma oficial da Meta e da autorização do responsável pela empresa.",
};

const systemIntegrations = [
  { id: "google", name: "Login com Google", description: "Permite que os usuários entrem no painel usando uma conta Google.", icon: ShieldCheck, status: "Em configuração", detail: "A configuração do provedor de login é feita pela administração do AtendeAI no Google Cloud e no Supabase. O cliente não precisa configurar isso." },
  { id: "supabase", name: "Supabase", description: "Infraestrutura de banco de dados, autenticação e armazenamento das informações.", icon: Cloud, status: "Conexão a validar", detail: "A conexão do projeto foi iniciada no Lovable. A administração do AtendeAI ainda precisa validar autenticação, segurança e persistência dos dados." },
  { id: "n8n", name: "n8n Automations", description: "Ferramenta interna para automatizar processos e conectar serviços.", icon: Workflow, status: "Não conectado", detail: "A administração do AtendeAI configura a instância, as credenciais e os webhooks do n8n. O cliente não precisa acessar essa ferramenta." },
];

function Integracoes() {
  const [details, setDetails] = useState<string | null>(null);
  const selected = details === "whatsapp" ? companyIntegration : systemIntegrations.find((item) => item.id === details);

  const IntegrationCard = ({ item, admin = false }: { item: typeof companyIntegration | typeof systemIntegrations[number]; admin?: boolean }) => {
    const Icon = item.icon;
    return (
      <Card className="flex h-full flex-col">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-muted p-3"><Icon className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{item.status}</p>
            {admin && <span className="mt-2 inline-flex rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">Gerenciada pelo AtendeAI</span>}
          </div>
          {item.id === "supabase" && <CheckCircle2 className="h-5 w-5 text-muted-foreground" />}
        </div>
        <p className="mt-4 flex-1 text-sm text-muted-foreground">{item.description}</p>
        <button onClick={() => setDetails(item.id)} className="mt-5 rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted">Ver detalhes</button>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Integrações" desc="Veja o que sua empresa precisa conectar e o que é cuidado pela equipe do AtendeAI." />
      <Card className="border-primary/20 bg-primary/[0.04]">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary"><Plug className="h-5 w-5" /></div>
          <div>
            <h2 className="font-semibold">Você não precisa configurar tudo</h2>
            <p className="mt-1 text-sm text-muted-foreground">Como cliente, sua principal conexão será o WhatsApp da sua empresa. Login, banco de dados e automações são configurações internas, gerenciadas pela administração do AtendeAI.</p>
          </div>
        </div>
      </Card>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-bold">Integrações da sua empresa</h2>
          <p className="text-sm text-muted-foreground">Conexões que o responsável pela empresa configura.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <IntegrationCard item={companyIntegration} />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-bold">Infraestrutura do AtendeAI</h2>
          <p className="text-sm text-muted-foreground">Serviços técnicos gerenciados pela administração. Não é necessário mexer neles para usar o painel.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {systemIntegrations.map((item) => <IntegrationCard key={item.id} item={item} admin />)}
        </div>
      </section>

      {selected && <Card>
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detalhes da integração</p><h3 className="mt-1 text-lg font-bold">{selected.name}</h3></div>
          <button onClick={() => setDetails(null)} className="text-sm text-muted-foreground hover:text-foreground">Fechar</button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{selected.detail}</p>
        <p className="mt-3 text-xs text-muted-foreground">Status atual: {selected.status}. Esta tela é informativa; ela ainda não conecta nem ativa serviços externos.</p>
      </Card>}
    </div>
  );
}
