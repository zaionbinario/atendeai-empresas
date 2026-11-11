import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, RotateCcw, CheckCheck } from "lucide-react";
import { Btn, PageHeader } from "@/components/app/ui";
import { novoId, useStore } from "@/lib/store";
import { responder } from "@/lib/simulador";
import { iaPodeResponder } from "@/lib/atendimento";
import type { Mensagem } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/simulador")({
  head: () => ({ meta: [{ title: "Simulador de conversa — Zyon Chat" }, { name: "description", content: "Teste o atendente virtual em uma conversa no estilo WhatsApp." }, { property: "og:title", content: "Simulador de conversa — Zyon Chat" }, { property: "og:description", content: "Simulador de conversa — Zyon Chat" }] }),
  component: Simulador,
});

const agora = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const sugestoes = ["Qual o horário?", "Vocês fazem entrega?", "Quanto custa o bolo?", "Ver produtos"];

function Simulador() {
  const store = useStore();
  const { conversas, setConversas, botAtivo, respostasRapidas } = store;
  const [texto, setTexto] = useState("");
  const fim = useRef<HTMLDivElement>(null);
  const conversa = conversas.find((c) => c.id === "simulador");
  const boasVindas = (): Mensagem => ({ id: "boas-vindas", de: "bot", texto: store.instrucoes.boasVindas, hora: agora() });
  const msgs = conversa?.mensagens.length ? conversa.mensagens : [boasVindas()];
  const humanoAssumiu = conversa?.status === "humano";

  useEffect(() => { fim.current?.scrollIntoView({ behavior: "auto" }); }, [msgs.length]);

  const enviar = (entrada: string) => {
    const pergunta = entrada.trim();
    if (!pergunta) return;
    const clienteMsg: Mensagem = { id: novoId(), de: "cliente", texto: pergunta, hora: agora() };
    const instante = new Date().toISOString();

    // Sem atraso artificial: não existe resposta pendente capaz de ignorar uma transferência.
    setConversas((anteriores) => {
      const atual = anteriores.find((c) => c.id === "simulador");
      const historico = atual?.mensagens.length ? atual.mensagens : [boasVindas()];
      const iaAtivaAqui = iaPodeResponder(botAtivo, atual);
      const novasMensagens: Mensagem[] = [...historico, clienteMsg];

      if (iaAtivaAqui) {
        novasMensagens.push({
          id: novoId(),
          de: "bot",
          texto: responder(pergunta, store, historico.slice(-8).map((m) => m.texto)),
          hora: agora(),
        });
      } else if (!botAtivo && atual?.status !== "humano") {
        novasMensagens.push({
          id: novoId(),
          de: "bot",
          texto: "Nosso atendimento automático está pausado no momento. Um atendente humano poderá continuar por aqui. 🙋",
          hora: agora(),
        });
      }

      const novaConversa = {
        id: "simulador",
        cliente: "Cliente do simulador",
        ultimaMensagem: pergunta,
        atualizadaEm: agora(),
        ultimaAtividadeEm: instante,
        status: iaAtivaAqui ? "ia" as const : "humano" as const,
        mensagens: novasMensagens,
      };
      return [novaConversa, ...anteriores.filter((c) => c.id !== "simulador")];
    });
    setTexto("");
  };
  const reiniciar = () => {
    setConversas((anteriores) => anteriores.map((c) =>
      c.id === "simulador" ? { ...c, mensagens: [boasVindas()], ultimaMensagem: "" } : c
    ));
    setTexto("");
  };

  return (
    <>
      <PageHeader title="Simulador de conversa" desc="Teste o atendente virtual em uma conversa de demonstração." action={
        <Btn type="button" variant="ghost" onClick={reiniciar}><RotateCcw className="h-4 w-4" />Reiniciar</Btn>
      } />
      <div className="mx-auto flex h-[70vh] max-w-md flex-col overflow-hidden rounded-3xl border shadow-xl">
        <div className="flex items-center gap-3 bg-wa-header p-3 text-wa-header-foreground">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-wa-header-foreground/20 font-bold">{store.instrucoes.nomeAtendente[0]}</div>
          <div>
            <p className="font-semibold">{store.instrucoes.nomeAtendente} · {store.empresas[0]?.nome}</p>
            <p className="text-xs opacity-80">
              {humanoAssumiu ? "Atendimento humano — IA pausada aqui" : !botAtivo ? "atendimento automático pausado" : "IA disponível"}
            </p>
          </div>
        </div>
        {humanoAssumiu && (
          <div className="border-b bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-800 dark:text-amber-200">
            Um atendente assumiu esta conversa. <Link to="/conversas" className="font-semibold underline">Responder no histórico</Link>.
          </div>
        )}
        <div className="wa-wallpaper flex-1 space-y-2 overflow-y-auto p-4">
          {msgs.map((mensagem) => (
            <div key={mensagem.id} className={cn("flex", mensagem.de === "cliente" && "justify-end")}>
              <div className={cn("max-w-[80%] whitespace-pre-line rounded-lg px-3 py-2 text-sm shadow-sm", mensagem.de === "cliente" ? "rounded-tr-none bg-wa-out" : "rounded-tl-none bg-card")}>
                {mensagem.texto}
                <span className="ml-2 inline-flex items-center gap-1 align-bottom text-[10px] text-muted-foreground">
                  {mensagem.hora}{mensagem.de === "cliente" && <CheckCheck className="h-3 w-3 text-wa-tick" />}
                </span>
              </div>
            </div>
          ))}
          <div ref={fim} />
        </div>
        <div className="flex gap-2 overflow-x-auto bg-wa-bar px-3 pt-2">
          {(respostasRapidas.length ? respostasRapidas : sugestoes).map((s) => (
            <button key={s} type="button" onClick={() => setTexto(s)} className="shrink-0 rounded-full border bg-card px-3 py-1 text-xs">{s}</button>
          ))}
        </div>
        <form className="flex gap-2 bg-wa-bar p-3" onSubmit={(e) => { e.preventDefault(); enviar(texto); }}>
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Digite uma mensagem" className="min-w-0 flex-1 rounded-full bg-card px-4 py-2.5 text-sm outline-none" />
          <button type="submit" aria-label="Enviar" disabled={!texto.trim()} className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"><Send className="h-5 w-5" /></button>
        </form>
      </div>
    </>
  );
}
