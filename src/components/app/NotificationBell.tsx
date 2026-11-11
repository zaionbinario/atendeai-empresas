import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, CheckCheck, MessageCircle, RefreshCw, UserRound } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useStore } from "@/lib/store";
import type { Notificacao } from "@/lib/notificacoes";
import { cn } from "@/lib/utils";

function IconeNotificacao({ tipo }: { tipo: Notificacao["tipo"] }) {
  if (tipo === "atendimento") return <UserRound className="h-4 w-4 text-amber-500" />;
  if (tipo === "atualizacao") return <RefreshCw className="h-4 w-4 text-emerald-500" />;
  return <MessageCircle className="h-4 w-4 text-sky-500" />;
}

export function NotificationBell() {
  const { notificacoes, marcarNotificacao, marcarTodasNotificacoes } = useStore();
  const [aberto, setAberto] = useState(false);
  const naoLidas = notificacoes.filter((n) => !n.lida).length;
  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <button type="button"
          aria-label={`Notificações, ${naoLidas} não lidas`}
          title="Notificações"
          className="relative rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-900">
          <Bell className="h-5 w-5" />
          {naoLidas > 0 && (
            <span aria-live="polite" className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {naoLidas > 99 ? "99+" : naoLidas}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-[min(92vw,380px)] overflow-hidden rounded-2xl p-0">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <h2 className="font-semibold">Notificações</h2>
            <p className="text-xs text-muted-foreground">{naoLidas} não {naoLidas === 1 ? "lida" : "lidas"}</p>
          </div>
          {naoLidas > 0 && (
            <button type="button" onClick={marcarTodasNotificacoes} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              <CheckCheck className="h-3.5 w-3.5" /> Marcar todas como lidas
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notificacoes.length === 0
            ? <div className="px-4 py-10 text-center text-sm text-muted-foreground">Nenhuma notificação por enquanto.</div>
            : notificacoes.map((notificacao) => (
              <Link
                key={notificacao.id}
                to={notificacao.tipo === "atualizacao" ? "/configuracoes" : "/conversas"}
                onClick={() => { marcarNotificacao(notificacao.id); setAberto(false); }}
                className={cn("flex gap-3 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-accent", !notificacao.lida && "bg-primary/5")}
              >
                <span className="mt-1 shrink-0"><IconeNotificacao tipo={notificacao.tipo} /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{notificacao.titulo}</span>
                    {!notificacao.lida && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{notificacao.texto}</span>
                  <span className="mt-1.5 block text-[11px] text-muted-foreground">
                    {new Date(notificacao.criadaEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </span>
              </Link>
            ))}
        </div>
        <p className="border-t px-4 py-2 text-center text-[11px] text-muted-foreground">Avisos internos deste navegador, sem notificações push.</p>
      </PopoverContent>
    </Popover>
  );
}
