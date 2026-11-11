import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, RotateCcw, CheckCheck } from "lucide-react";
import { Btn, PageHeader } from "@/components/app/ui";
import { novoId, useStore } from "@/lib/store";
import { responder } from "@/lib/simulador";
import type { Mensagem } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/simulador")({
  head: () => ({ meta: [{ title: "Simulador de conversa — Zyon Chat" }, { name: "description", content: "Teste o atendente virtual em uma conversa no estilo WhatsApp." }, { property: "og:title", content: "Simulador de conversa — Zyon Chat" }, { property: "og:description", content: "Teste o atendente virtual em uma conversa no estilo WhatsApp." }] }),
  component: Simulador,
});
const agora = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const sugestoes = ["Qual o horário?", "Vocês fazem entrega?", "Quanto custa o bolo?", "Ver produtos"];
function Simulador() {
  const store = useStore();
  const { conversas, setConversas, botAtivo, respostasRapidas } = store;
  const inicial = (): Mensagem[] => [{ id: "0", de: "bot", texto: store.instrucoes.boasVindas, hora: agora() }];
  const [msgs, setMsgs] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [digitando, setDigitando] = useState(false);
  const fim = useRef<HTMLDivElement>(null);
  useEffect(() => { setMsgs(inicial()); }, []);
  useEffect(() => { fim.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, digitando]);
  const enviar = (t: string) => { if (!t.trim()) return;
    const clienteMsg: Mensagem = { id: novoId(), de: "cliente", texto: t, hora: agora() };
    const historico = [...msgs, clienteMsg];
    setMsgs(historico); setTexto("");
    if (!botAtivo) {
      const aviso: Mensagem = { id: novoId(), de: "bot", texto: "Nosso atendimento automático está pausado no momento. Um atendente humano poderá continuar por aqui. 🙋", hora: agora() };
      const final = [...historico, aviso]; setMsgs(final);
      setConversas([{ id: "simulador", cliente: "Cliente do simulador", ultimaMensagem: t, atualizadaEm: agora(), status: "humano", mensagens: final }, ...conversas.filter((c) => c.id !== "simulador")]);
      return;
    }
    setDigitando(true);
    setTimeout(() => {
      const resposta: Mensagem = { id: novoId(), de: "bot", texto: responder(t, store, historico.slice(-8).map((m) => m.texto)), hora: agora() };
      const final = [...historico, resposta]; setDigitando(false); setMsgs(final);
      setConversas([{ id: "simulador", cliente: "Cliente do simulador", ultimaMensagem: t, atualizadaEm: agora(), status: "ia", mensagens: final }, ...conversas.filter((c) => c.id !== "simulador")]);
    }, 900);
  };
  return (<>
    <PageHeader title="Simulador de conversa" desc="Converse como se fosse um cliente e veja as respostas do atendente." action={<Btn variant="ghost" onClick={() => setMsgs(inicial())}><RotateCcw className="h-4 w-4" />Reiniciar</Btn>} />
    <div className="mx-auto flex h-[70vh] max-w-md flex-col overflow-hidden rounded-3xl border shadow-xl">
      <div className="flex items-center gap-3 bg-wa-header p-3 text-wa-header-foreground">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-wa-header-foreground/20 font-bold">{store.instrucoes.nomeAtendente[0]}</div>
        <div><p className="font-semibold">{store.instrucoes.nomeAtendente} · {store.empresas[0]?.nome}</p><p className="text-xs opacity-80">{!botAtivo ? "atendimento automático pausado" : digitando ? "digitando..." : "online"}</p></div>
      </div>
      <div className="wa-wallpaper flex-1 space-y-2 overflow-y-auto p-4">
        {msgs.map((m) => (<div key={m.id} className={cn("flex", m.de === "cliente" && "justify-end")}>
          <div className={cn("max-w-[80%] whitespace-pre-line rounded-lg px-3 py-2 text-sm shadow-sm", m.de === "cliente" ? "rounded-tr-none bg-wa-out" : "rounded-tl-none bg-card")}>
            {m.texto}<span className="ml-2 inline-flex items-center gap-1 align-bottom text-[10px] text-muted-foreground">{m.hora}{m.de === "cliente" && <CheckCheck className="h-3 w-3 text-wa-tick" />}</span></div></div>))}
        {digitando && <div className="w-16 rounded-lg bg-card px-3 py-2 text-center text-muted-foreground shadow-sm">•••</div>}
        <div ref={fim} />
      </div>
      <div className="flex gap-2 overflow-x-auto bg-wa-bar px-3 pt-2">{(respostasRapidas.length ? respostasRapidas : sugestoes).map((s) => (
        <button key={s} onClick={() => setTexto(s)} className="shrink-0 rounded-full border bg-card px-3 py-1 text-xs">{s}</button>))}</div>
      <form className="flex gap-2 bg-wa-bar p-3" onSubmit={(e) => { e.preventDefault(); enviar(texto); }}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Digite uma mensagem" className="flex-1 rounded-full bg-card px-4 py-2.5 text-sm outline-none" />
        <button aria-label="Enviar" className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground"><Send className="h-5 w-5" /></button>
      </form>
    </div>
  </>);
}
