import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Bot, ChevronDown, Clock3, MessageCircle, Send, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Btn, Card, PageHeader } from "@/components/app/ui";
import { novoId, useStore } from "@/lib/store";
import { registrarRespostaHumana, transferirAtendimento } from "@/lib/atendimento";
import type { Conversa, Mensagem } from "@/lib/types";

export const Route = createFileRoute("/conversas")({
  head: () => ({ meta: [{ title: "Conversas — Zyon Chat" }] }),
  component: Conversas,
});

const POR_PAGINA = 15;
const horaAtual = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

function ItemConversa({
  conversa,
  assumir,
  devolver,
  enviarResposta,
}: {
  conversa: Conversa;
  assumir: (id: string) => void;
  devolver: (id: string) => void;
  enviarResposta: (id: string, texto: string) => void;
}) {
  const [aberta, setAberta] = useState(false);
  const [resposta, setResposta] = useState("");
  const humano = conversa.status === "humano";
  const pendente = conversa.aguardandoHumano === true;
  const enviar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!humano || !resposta.trim()) return;
    enviarResposta(conversa.id, resposta.trim());
    setResposta("");
  };

  return (
    <div className="rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary"><UserRound className="h-5 w-5" /></span>
          <div className="min-w-0">
            <p className="font-semibold">{conversa.cliente}</p>
            <p className="truncate text-sm text-muted-foreground">{conversa.ultimaMensagem}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="h-3 w-3" />{conversa.atualizadaEm} · {conversa.mensagens.length} mensagens
            </p>
          </div>
        </div>
        <span className={humano
          ? "rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600"
          : conversa.status === "resolvida"
            ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600"
            : "rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-600"}>
          {pendente ? "Aguardando atendente" : humano ? "Humano" : conversa.status === "resolvida" ? "Resolvida" : "IA"}
        </span>
      </div>
      <button
        type="button"
        aria-expanded={aberta}
        onClick={() => setAberta((prev) => !prev)}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
      >
        {aberta ? "Ocultar mensagens" : humano ? "Abrir atendimento" : "Ver mensagens"}
        <ChevronDown className={`h-4 w-4 transition-transform ${aberta ? "rotate-180" : ""}`} />
      </button>
      {aberta && (
        <div className="mt-3 space-y-2 rounded-lg bg-muted/40 p-3">
          {conversa.mensagens.map((mensagem) => (
            <div key={mensagem.id} className={mensagem.de === "cliente" ? "text-right" : "text-left"}>
              <span className="inline-block max-w-[90%] whitespace-pre-wrap break-words rounded-xl bg-background px-3 py-2 text-sm">
                {mensagem.texto}
              </span>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {mensagem.de === "cliente" ? "Cliente" : mensagem.de === "humano" ? "Você" : "IA"} · {mensagem.hora}
              </p>
            </div>
          ))}
          {humano && (
            <form onSubmit={enviar} className="space-y-2 border-t pt-3">
              <label htmlFor={`resposta-${conversa.id}`} className="text-sm font-medium">
                Responder como atendente humano
              </label>
              <textarea
                id={`resposta-${conversa.id}`}
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                rows={2}
                maxLength={3000}
                placeholder="Digite sua resposta..."
                className="w-full resize-y rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Demonstração: salva no navegador, não envia pelo WhatsApp.</span>
                <Btn type="submit" disabled={!resposta.trim()}><Send className="h-4 w-4" /> Registrar resposta</Btn>
              </div>
            </form>
          )}
        </div>
      )}
      <div className="mt-3 flex justify-end">
        {humano
          ? <Btn type="button" variant="ghost" onClick={() => devolver(conversa.id)}>
              <Bot className="h-4 w-4" /> Devolver para IA
            </Btn>
          : <Btn type="button" onClick={() => { assumir(conversa.id); setAberta(true); }}>
              <UserRound className="h-4 w-4" /> Assumir conversa
            </Btn>}
      </div>
    </div>
  );
}

function Conversas() {
  const { conversas, setConversas } = useStore();
  const [limite, setLimite] = useState(POR_PAGINA);
  const [somentePendentes, setSomentePendentes] = useState(false);
  const lista = conversas.filter((c) => !somentePendentes || c.aguardandoHumano);

  const assumir = (id: string) => {
    setConversas((anteriores) => transferirAtendimento(anteriores, id, "humano").map((c) => c.id === id ? { ...c, aguardandoHumano: false } : c));
    toast.success("Conversa assumida. A IA fica pausada somente neste atendimento.");
  };
  const devolver = (id: string) => {
    setConversas((anteriores) => transferirAtendimento(anteriores, id, "ia").map((c) => c.id === id ? { ...c, aguardandoHumano: false } : c));
    toast.success("Conversa devolvida para a IA.");
  };
  const enviarResposta = (id: string, texto: string) => {
    const mensagem: Mensagem = { id: novoId(), de: "humano", texto, hora: horaAtual() };
    const dataIso = new Date().toISOString();
    setConversas((anteriores) => registrarRespostaHumana(anteriores, id, mensagem, dataIso).map((c) => c.id === id ? { ...c, aguardandoHumano: false } : c));
    toast.success("Resposta registrada neste navegador (não enviada ao WhatsApp).");
  };

  return (
    <>
      <PageHeader title="Histórico de conversas" desc="Assuma um atendimento e registre respostas pelo painel (modo demonstração)." />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card><p className="text-sm text-muted-foreground">Total de conversas</p><p className="mt-1 text-3xl font-bold">{conversas.length}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Com atendimento humano</p><p className="mt-1 text-3xl font-bold">{conversas.filter((c) => c.status === "humano").length}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Atendidas pela IA</p><p className="mt-1 text-3xl font-bold">{conversas.filter((c) => c.status === "ia").length}</p></Card>
      </div>
      <div className="mb-3 flex items-center gap-2"><input id="filtrar-pendentes" type="checkbox" checked={somentePendentes} onChange={(e) => setSomentePendentes(e.target.checked)} /><label htmlFor="filtrar-pendentes" className="text-sm">Mostrar somente conversas aguardando atendente</label></div>
      <Card className="space-y-3">
        {lista.length === 0
          ? <div className="py-12 text-center">
              <MessageCircle className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-semibold">Nenhuma conversa registrada ainda</p>
              <p className="mt-1 text-sm text-muted-foreground">Use o simulador para criar atendimentos de demonstração.</p>
            </div>
          : <>
              {lista.slice(0, limite).map((conversa) => (
                <ItemConversa
                  key={conversa.id}
                  conversa={conversa}
                  assumir={assumir}
                  devolver={devolver}
                  enviarResposta={enviarResposta}
                />
              ))}
              {lista.length > limite && (
                <div className="pt-2 text-center">
                  <Btn type="button" variant="ghost" onClick={() => setLimite((valor) => valor + POR_PAGINA)}>
                    Carregar mais conversas ({lista.length - limite} restantes)
                  </Btn>
                </div>
              )}
            </>}
      </Card>
    </>
  );
}
