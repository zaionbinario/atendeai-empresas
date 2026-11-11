import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, CheckCheck, ChevronRight, MessageCircle, RefreshCw, UserRound } from "lucide-react";
import { Btn, Card, PageHeader } from "@/components/app/ui";
import { useStore } from "@/lib/store";
import type { Notificacao } from "@/lib/notificacoes";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notificacoes")({
  head: () => ({
    meta: [{ title: "Notificações — Zyon Chat" }, { name: "description", content: "Consulte todos os avisos e atualizações do seu atendimento." }],
  }),
  component: Notificacoes,
});

function IconeNotificacao({ tipo }: { tipo: Notificacao["tipo"] }) {
  if (tipo === "atendimento") return <UserRound className="h-5 w-5 text-amber-500" />;
  if (tipo === "atualizacao") return <RefreshCw className="h-5 w-5 text-emerald-500" />;
  return <MessageCircle className="h-5 w-5 text-sky-500" />;
}

function formatarData(dataIso: string) {
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return "Data não disponível";
  return data.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });
}

const categorias: Record<Notificacao["tipo"], string> = {
  atendimento: "Atendimento humano",
  nova_conversa: "Nova conversa",
  atualizacao: "Atualização do sistema",
};

function Notificacoes() {
  const { notificacoes, marcarNotificacao, marcarTodasNotificacoes } = useStore();
  const [selecionadaId, setSelecionadaId] = useState<string | null>(null);
  const selecionada = notificacoes.find((n) => n.id === selecionadaId);
  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const abrir = (id: string) => {
    setSelecionadaId(id);
    // Somente ao entrar no aviso ele passa para lido, preservando os outros.
    marcarNotificacao(id);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notificações"
        desc="Todos os avisos e atualizações do seu atendimento, em um só lugar."
        action={naoLidas > 0 ? (
          <Btn type="button" variant="ghost" onClick={marcarTodasNotificacoes}>
            <CheckCheck className="h-4 w-4" /> Marcar todas como lidas
          </Btn>
        ) : undefined}
      />
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="rounded-full border bg-card px-3 py-1.5 font-medium">
          {notificacoes.length} {notificacoes.length === 1 ? "notificação" : "notificações"}
        </span>
        <span className="rounded-full border bg-card px-3 py-1.5 font-medium">
          {naoLidas} não {naoLidas === 1 ? "lida" : "lidas"}
        </span>
      </div>
      {notificacoes.length === 0 ? (
        <Card className="py-14 text-center">
          <Bell className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-3 font-semibold">Nenhuma notificação ainda</h2>
          <p className="mt-1 text-sm text-muted-foreground">Novidades e avisos de atendimento aparecerão aqui.</p>
        </Card>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card className="overflow-hidden p-0">
            <div className="border-b px-4 py-3 text-sm font-semibold">Todas as notificações</div>
            <div className="max-h-[70vh] overflow-y-auto">
              {notificacoes.map((notificacao) => (
                <button
                  key={notificacao.id}
                  type="button"
                  onClick={() => abrir(notificacao.id)}
                  aria-pressed={selecionadaId === notificacao.id}
                  className={cn(
                    "flex w-full items-start gap-3 border-b px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-accent",
                    !notificacao.lida && "bg-primary/5",
                    selecionadaId === notificacao.id && "bg-accent/70"
                  )}
                >
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted">
                    <IconeNotificacao tipo={notificacao.tipo} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={cn("text-sm", notificacao.lida ? "font-medium" : "font-bold")}>
                        {notificacao.titulo}
                      </span>
                      {!notificacao.lida && (
                        <span aria-label="Não lida" className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      {notificacao.texto}
                    </span>
                    <span className="mt-2 block text-[11px] text-muted-foreground">{formatarData(notificacao.criadaEm)}</span>
                  </span>
                  <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </Card>
          <Card className="lg:sticky lg:top-24">
            {!selecionada ? (
              <div className="py-10 text-center">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
                <h2 className="mt-3 font-semibold">Selecione uma notificação</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Clique em um aviso da lista para abrir os detalhes e marcá-lo como lido.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-muted">
                    <IconeNotificacao tipo={selecionada.tipo} />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {categorias[selecionada.tipo]}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold">{selecionada.titulo}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{formatarData(selecionada.criadaEm)}</p>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{selecionada.texto}</p>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCheck className="h-4 w-4" /> Notificação lida
                </span>
                <div className="border-t pt-4">
                  <Link
                    to={selecionada.tipo === "atualizacao" ? "/configuracoes" : "/conversas"}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    {selecionada.tipo === "atualizacao" ? "Abrir configurações" : "Ir para histórico de conversas"}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        As notificações ficam salvas neste navegador. Não são avisos push nem mensagens enviadas pelo WhatsApp.
      </p>
    </div>
  );
}
