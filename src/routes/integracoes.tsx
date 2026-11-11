import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Plug } from "lucide-react";
import { Card, PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/integracoes")({
  head: () => ({ meta: [{ title: "Integrações — Zyon Chat" }, { name: "description", content: "Conecte os canais da sua empresa ao AtendeAI." }] }),
  component: Integracoes,
});

const whatsapp = {
  name: "WhatsApp Business",
  description: "Conecte o número comercial da sua empresa para receber mensagens e permitir que o AtendeAI responda seus clientes.",
  status: "Configuração necessária",
  detail: "O responsável pela empresa deverá conectar e autorizar o próprio número do WhatsApp Business. A ativação dependerá da configuração da plataforma oficial da Meta.",
};

function Integracoes() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="Integrações" desc="Conecte os canais que sua empresa usa para atender os clientes." />
      <Card className="border-primary/20 bg-primary/[0.04]">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary"><Plug className="h-5 w-5" /></div>
          <div>
            <h2 className="font-semibold">Conecte o WhatsApp da sua empresa</h2>
            <p className="mt-1 text-sm text-muted-foreground">As configurações técnicas do AtendeAI são cuidadas pela nossa equipe. Aqui você só precisa conectar os canais da sua própria empresa.</p>
          </div>
        </div>
      </Card>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-bold">Canais da sua empresa</h2>
          <p className="text-sm text-muted-foreground">Conecte o canal pelo qual seus clientes conversam com você.</p>
        </div>
        <Card className="flex flex-col">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-muted p-3"><MessageCircle className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold">{whatsapp.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{whatsapp.status}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{whatsapp.description}</p>
          <button onClick={() => setShowDetails((value) => !value)} className="mt-5 self-start rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted">{showDetails ? "Ocultar detalhes" : "Ver detalhes"}</button>
          {showDetails && <div className="mt-4 rounded-xl bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">{whatsapp.detail}</p>
            <p className="mt-2 text-xs text-muted-foreground">Esta tela ainda é informativa: a conexão do WhatsApp será implementada em uma próxima etapa.</p>
          </div>}
        </Card>
      </section>
    </div>
  );
}
