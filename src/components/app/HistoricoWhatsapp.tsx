import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/auth-client";
import { useStore } from "@/lib/store";

type ConversaReal = { id: string; empresa_id: string; contato_whatsapp: string; status: string; atendimento_humano: boolean; atualizado_em: string };
type MensagemReal = { id: string; conversa_id: string; conteudo: string | null; tipo: string; enviada_por_mim: boolean; criado_em: string };
const formatar = (data: string) => new Date(data).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

const contatoLegivel = (jid: string) => {
  const [identificador, dominio] = jid.split("@");
  if (dominio !== "s.whatsapp.net" || !/^\d+$/.test(identificador)) return null;
  const numero = identificador.startsWith("55") ? identificador.slice(2) : identificador;
  if (identificador.startsWith("55") && numero.length === 11) return `+55 (${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
  if (identificador.startsWith("55") && numero.length === 10) return `+55 (${numero.slice(0, 2)}) ${numero.slice(2, 6)}-${numero.slice(6)}`;
  return `+${identificador}`;
};

export function HistoricoWhatsapp() {
  const { empresaSelecionadaId } = useStore();
  const [conversas, setConversas] = useState<ConversaReal[]>([]);
  const [ultimaMensagemPorConversa, setUltimaMensagemPorConversa] = useState<Record<string, string>>({});
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<MensagemReal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [carregandoMensagens, setCarregandoMensagens] = useState(false);
  const [rascunho, setRascunho] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");
  const carregarConversas = useCallback(async () => {
    if (!supabase || !empresaSelecionadaId) { setConversas([]); setCarregando(false); return; }
    const { data, error } = await supabase.from("conversas").select("id,empresa_id,contato_whatsapp,status,atendimento_humano,atualizado_em").eq("empresa_id", empresaSelecionadaId).order("atualizado_em", { ascending: false }).limit(200);
    if (error) setErro("Não foi possível carregar conversas: " + error.message);
    else {
      setConversas((data ?? []) as ConversaReal[]);
      const ids = (data ?? []).map(c => c.id);
      if (ids.length) {
        const { data: recentes } = await supabase.from("mensagens")
          .select("conversa_id,criado_em")
          .eq("empresa_id", empresaSelecionadaId)
          .in("conversa_id", ids)
          .order("criado_em", { ascending: false })
          .limit(2000);
        if (recentes) {
          const datas: Record<string, string> = {};
          for (const msg of recentes) if (!datas[msg.conversa_id]) datas[msg.conversa_id] = msg.criado_em;
          setUltimaMensagemPorConversa(datas);
        }
      } else setUltimaMensagemPorConversa({});
      setErro("");
    }
    setCarregando(false);
  }, [empresaSelecionadaId]);
  const carregarMensagens = useCallback(async () => {
    if (!supabase || !empresaSelecionadaId || !selecionada) { setMensagens([]); return; }
    const { data, error } = await supabase.from("mensagens").select("id,conversa_id,conteudo,tipo,enviada_por_mim,criado_em").eq("empresa_id", empresaSelecionadaId).eq("conversa_id", selecionada).order("criado_em", { ascending: true }).limit(500);
    if (error) setErro("Não foi possível carregar mensagens: " + error.message);
    else { setMensagens((data ?? []) as MensagemReal[]); setErro(""); }
    setCarregandoMensagens(false);
  }, [empresaSelecionadaId, selecionada]);
  useEffect(() => { setCarregando(true); setSelecionada(null); setMensagens([]); void carregarConversas(); }, [carregarConversas]);
  useEffect(() => { setCarregandoMensagens(Boolean(selecionada)); setRascunho(""); setErroEnvio(""); void carregarMensagens(); }, [carregarMensagens, selecionada]);
  useEffect(() => {
    if (!empresaSelecionadaId || !supabase) return;
    // Polling funciona mesmo quando a publicação Realtime não está configurada.
    const intervalo = window.setInterval(() => { void carregarConversas(); if (selecionada) void carregarMensagens(); }, 10000);
    return () => window.clearInterval(intervalo);
  }, [empresaSelecionadaId, selecionada, carregarConversas, carregarMensagens]);
  const enviarMensagem = async () => {
    const conteudo = rascunho.trim();
    if (!supabase || !empresaSelecionadaId || !selecionada || !conteudo || enviando) return;
    setEnviando(true);
    setErroEnvio("");
    try {
      // A Edge Function deve validar o JWT, a associação à empresa e a conversa.
      // Nunca expor a chave da Evolution API no navegador.
      const { data, error } = await supabase.functions.invoke("zyon-whatsapp-enviar", {
        body: { empresa_id: empresaSelecionadaId, conversa_id: selecionada, conteudo },
      });
      if (error || !data?.sucesso) throw new Error(error?.message || data?.erro || "O servidor não confirmou o envio.");
      setRascunho("");
      await Promise.all([carregarMensagens(), carregarConversas()]);
    } catch (e) {
      setErroEnvio(e instanceof Error ? e.message : "Não foi possível enviar a mensagem.");
    } finally {
      setEnviando(false);
    }
  };
  const conversasOrdenadas = [...conversas].sort((a, b) =>
    new Date(ultimaMensagemPorConversa[b.id] ?? b.atualizado_em).getTime() -
    new Date(ultimaMensagemPorConversa[a.id] ?? a.atualizado_em).getTime()
  );
  const atual = conversas.find(c => c.id === selecionada);
  // A tabela de conversas não fornece nome de contato; use o número estável quando disponível.
  const rotuloContato = (c: ConversaReal) => contatoLegivel(c.contato_whatsapp) ?? `Contato ${c.id.slice(0, 8)}`;
  return <section className="space-y-4">
    <div className="rounded-xl border bg-card p-4">
      <h2 className="font-semibold">Conversas reais do WhatsApp</h2>
      <p className="text-sm text-muted-foreground">Atualização automática a cada 10 segundos. O envio depende da função segura zyon-whatsapp-enviar estar configurada no Supabase.</p>
    </div>
    {erro && <div role="alert" className="rounded-xl border border-destructive p-3 text-sm text-destructive">{erro}</div>}
    {!empresaSelecionadaId && <p className="text-sm">Aguardando seleção da empresa...</p>}
    {carregando && <p role="status">Carregando conversas...</p>}
    {!carregando && empresaSelecionadaId && conversas.length === 0 && !erro && <p className="rounded-xl border p-6 text-sm">Nenhuma conversa real encontrada para esta empresa.</p>}
    <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div className="max-h-[65vh] space-y-2 overflow-y-auto">
        {conversasOrdenadas.map(c => <button key={c.id} type="button" onClick={() => setSelecionada(c.id)} className={`w-full min-w-0 rounded-xl border p-3 text-left hover:bg-muted/50 ${selecionada === c.id ? "border-primary bg-muted/30" : ""}`}>
          <span className="block truncate font-medium">{rotuloContato(c)}</span>
          <span className="block truncate text-xs text-muted-foreground">{contatoLegivel(c.contato_whatsapp) ?? "Identificador do WhatsApp indisponível"}</span>
          <span className="block text-xs text-muted-foreground">{formatar(ultimaMensagemPorConversa[c.id] ?? c.atualizado_em)} · {c.atendimento_humano ? "Atendimento humano" : c.status}</span>
        </button>)}
      </div>
      <div className="min-w-0 rounded-xl border bg-card p-4">
        {!atual ? <p className="text-sm text-muted-foreground">Selecione uma conversa para ver as mensagens.</p> : <>
          <h3 className="font-semibold">{rotuloContato(atual)}</h3>
          <p className="mb-3 text-xs text-muted-foreground">{contatoLegivel(atual.contato_whatsapp) ?? "Identificador do WhatsApp indisponível"}</p>
          {carregandoMensagens && <p className="text-sm">Carregando mensagens...</p>}
          <div className="max-h-[60vh] space-y-3 overflow-y-auto" aria-live="polite">
            {mensagens.map(m => <div key={m.id} className={`flex ${m.enviada_por_mim ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[90%] rounded-xl bg-muted px-3 py-2 text-sm">
                <p className="whitespace-pre-wrap break-words">{m.conteudo || `[Mensagem do tipo ${m.tipo}]`}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{m.enviada_por_mim ? "Enviada" : "Recebida"} · {formatar(m.criado_em)}</p>
              </div>
            </div>)}
            {!carregandoMensagens && mensagens.length === 0 && !erro && <p className="text-sm text-muted-foreground">Nenhuma mensagem nesta conversa.</p>}
          </div>
          <form className="mt-4 space-y-2 border-t pt-3" onSubmit={e => { e.preventDefault(); void enviarMensagem(); }}>
            <label htmlFor="resposta-whatsapp" className="block text-sm font-medium">Responder pelo WhatsApp</label>
            <textarea id="resposta-whatsapp" value={rascunho} onChange={e => setRascunho(e.target.value)}
              placeholder="Digite sua mensagem..." rows={3} maxLength={4000}
              className="w-full resize-y rounded-lg border bg-background p-3 text-sm text-foreground"
              disabled={enviando} />
            {erroEnvio && <p role="alert" className="text-sm text-destructive">Mensagem não enviada: {erroEnvio}</p>}
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Só aparece como enviada após confirmação do servidor.</p>
              <button type="submit" disabled={enviando || !rascunho.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
                {enviando ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </form>
        </>}
      </div>
    </div>
  </section>;
}
