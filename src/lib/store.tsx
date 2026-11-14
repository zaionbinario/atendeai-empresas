// Estado compartilhado do painel. Persistência local de demonstração; backend será conectado depois.
import { createContext, useContext, useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import * as d from "./demo-data";
import { supabase } from "./auth-client";
import { toast } from "sonner";
import type { Empresa, Produto, Horario, Faq, Instrucoes, Conversa } from "./types";
import { detectarEventosDeConversas, inserirNotificacao, marcarNotificacaoLida, VERSAO_AVISO, type Notificacao } from "./notificacoes";

type Store = {
  empresas: Empresa[]; setEmpresas: Dispatch<SetStateAction<Empresa[]>>;
  produtos: Produto[]; setProdutos: (v: Produto[]) => void; salvarProdutos: (v: Produto[]) => Promise<boolean>;
  horarios: Horario[]; setHorarios: (v: Horario[]) => void;
  faqs: Faq[]; setFaqs: (v: Faq[]) => void;
  instrucoes: Instrucoes; setInstrucoes: (v: Instrucoes) => void;
  empresaSelecionadaId: string; setEmpresaSelecionadaId: (id: string) => void;
  instrucoesPorEmpresa: Record<string, Instrucoes>; setInstrucoesPorEmpresa: Dispatch<SetStateAction<Record<string, Instrucoes>>>;
  conversas: Conversa[]; setConversas: Dispatch<SetStateAction<Conversa[]>>;
  respostasRapidas: string[]; setRespostasRapidas: (v: string[]) => void;
  botAtivo: boolean; setBotAtivo: (v: boolean) => void;
  ultimoResetIndicadores: number | null; zerarIndicadores: () => void;
  notificacoes: Notificacao[];
  marcarNotificacao: (id: string) => void;
  marcarTodasNotificacoes: () => void;
  limparTodasNotificacoes: () => void;
};
const Ctx = createContext<Store | null>(null);
function usePersistido<T>(chave: string, inicial: T): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [valor, setValor] = useState<T>(inicial);
  const [pronto, setPronto] = useState(false);
  useEffect(() => {
    try { const salvo = localStorage.getItem(chave); if (salvo) setValor(JSON.parse(salvo) as T); } catch { /* mantém dados iniciais */ }
    setPronto(true);
  }, [chave]);
  useEffect(() => { if (pronto) { try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* armazenamento indisponível */ } } }, [chave, valor, pronto]);
  return [valor, setValor, pronto];
}
export function StoreProvider({ children }: { children: ReactNode }) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  // Dados comerciais são privados por empresa, nunca compartilhados pelo localStorage.
  const [produtos, setProdutosState] = useState<Produto[]>([]);
  const [horarios, setHorariosState] = useState<Horario[]>([]);
  const [faqs, setFaqsState] = useState<Faq[]>([]);
  const [empresaDadosId, setEmpresaDadosId] = useState("");
  const [dadosProntos, setDadosProntos] = useState(false);
  const empresaDadosIdRef = useRef("");
  const dadosProntosRef = useRef(false);
  useEffect(() => {
    let cancelled = false;
    async function carregarDados() {
      empresaDadosIdRef.current = "";
      dadosProntosRef.current = false;
      setDadosProntos(false);
      setProdutosState([]);
      setHorariosState([]);
      setFaqsState([]);
      if (!supabase) return;
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (cancelled || authError || !auth.user) return;
      const { data: vinculos, error: vinculosError } = await supabase.from("empresa_usuarios").select("empresa_id").eq("usuario_id", auth.user.id);
      if (cancelled || vinculosError || !vinculos?.length) return;
      const { data: ativas, error: empresasError } = await supabase.from("empresas").select("id,nome").in("id", vinculos.map(v => v.empresa_id)).eq("status", "ativa").order("criado_em", { ascending: true }).limit(1);
      if (cancelled || empresasError || !ativas?.length) return;
      const id = ativas[0].id;
      setEmpresas(ativas.map(e => ({ id: e.id, nome: e.nome, segmento: "", telefone: "", cidade: "", ativa: true })));
      const { data, error } = await supabase.from("empresa_dados").select("secao,conteudo").eq("empresa_id", id);
      if (cancelled) return;
      if (error) { toast.error("Não foi possível carregar os dados da empresa: " + error.message); return; }
      const sections = new Map((data ?? []).map(item => [item.secao, item.conteudo]));
      setProdutosState(Array.isArray(sections.get("produtos")) ? sections.get("produtos") as Produto[] : []);
      setHorariosState(Array.isArray(sections.get("horarios")) ? sections.get("horarios") as Horario[] : d.horariosDemo);
      setFaqsState(Array.isArray(sections.get("faqs")) ? sections.get("faqs") as Faq[] : []);
      const savedAssistant = sections.get("instrucoes");
      setInstrucoesPorEmpresaState(savedAssistant && typeof savedAssistant === "object" && !Array.isArray(savedAssistant) ? { [id]: savedAssistant as Instrucoes } : {});
      setEmpresaSelecionadaId(id);
      empresaDadosIdRef.current = id;
      dadosProntosRef.current = true;
      setEmpresaDadosId(id);
      setDadosProntos(true);
    }
    void carregarDados();
    return () => { cancelled = true; };
  }, []);
  async function salvarSecao(secao: "produtos" | "horarios" | "faqs", conteudo: Produto[] | Horario[] | Faq[]): Promise<boolean> {
    const id = empresaDadosIdRef.current;
    if (!supabase || !id || !dadosProntosRef.current) { toast.error("Aguarde o carregamento da empresa."); return false; }
    const { error } = await supabase.from("empresa_dados").upsert({
      empresa_id: id, secao, conteudo, atualizado_em: new Date().toISOString(),
    }, { onConflict: "empresa_id,secao" });
    if (error) { toast.error("Erro ao salvar no Supabase: " + error.message); return false; }
    if (secao === "produtos") setProdutosState(conteudo as Produto[]);
    if (secao === "horarios") setHorariosState(conteudo as Horario[]);
    if (secao === "faqs") setFaqsState(conteudo as Faq[]);
    toast.success("Dados salvos no Supabase!");
    return true;
  }
  const salvarProdutos = (v: Produto[]) => salvarSecao("produtos", v);
  const setProdutos = (v: Produto[]) => { void salvarProdutos(v); };
  const setHorarios = (v: Horario[]) => { void salvarSecao("horarios", v); };
  const setFaqs = (v: Faq[]) => { void salvarSecao("faqs", v); };
  const [instrucoes, setInstrucoes] = useState<Instrucoes>({ nomeAtendente: "Atendente virtual", tom: "amigavel", boasVindas: "", regras: "", transferirHumano: true });
  const [empresaSelecionadaId, setEmpresaSelecionadaId] = useState("");
  const [instrucoesPorEmpresa, setInstrucoesPorEmpresaState] = useState<Record<string, Instrucoes>>({});
  const setInstrucoesPorEmpresa: Dispatch<SetStateAction<Record<string, Instrucoes>>> = (action) => {
    setInstrucoesPorEmpresaState(previous => {
      const next = typeof action === "function" ? action(previous) : action;
      const id = empresaDadosIdRef.current;
      if (id && next[id] && supabase) {
        void supabase.from("empresa_dados").upsert({
          empresa_id: id, secao: "instrucoes", conteudo: next[id], atualizado_em: new Date().toISOString()
        }, { onConflict: "empresa_id,secao" }).then(({ error }) => {
          if (error) toast.error("Erro ao salvar atendente: " + error.message);
        });
      }
      return next;
    });
  };
  const [conversas, setConversas, conversasProntas] = usePersistido<Conversa[]>("zyon-conversas", []);
  const [respostasRapidas, setRespostasRapidas] = usePersistido<string[]>("zyon-respostas-rapidas", ["Olá! Como posso ajudar? 😊", "Só um momento, vou verificar essa informação.", "Obrigado pelo contato! Estamos à disposição."]);
  const [botAtivo, setBotAtivo] = usePersistido("zyon-bot-ativo", true);
  const [notificacoes, setNotificacoes, notificacoesProntas] = usePersistido<Notificacao[]>("zyon-notificacoes", []);
  const statusAnteriores = useRef<Map<string, Conversa["status"]> | null>(null);

  const marcarNotificacao = (id: string) =>
    setNotificacoes((atuais) => marcarNotificacaoLida(atuais, id));
  const marcarTodasNotificacoes = () =>
    setNotificacoes((atuais) => atuais.map((n) => n.lida ? n : { ...n, lida: true }));
  const limparTodasNotificacoes = () => setNotificacoes([]);

  useEffect(() => {
    if (!conversasProntas || !notificacoesProntas) return;

    const estadosAtuais = new Map(conversas.map((c) => [c.id, c.status] as const));
    if (statusAnteriores.current !== null) {
      let geraisAtivas = true;
      let avisarNovas = true;
      try {
        const preferencias = JSON.parse(localStorage.getItem("zyon-chat-preferencias") || "{}") as {
          notificacoes?: boolean;
          avisosAtendimento?: boolean;
        };
        geraisAtivas = preferencias.notificacoes !== false;
        avisarNovas = preferencias.avisosAtendimento !== false;
      } catch { /* usa preferências padrão */ }

      if (geraisAtivas) {
        const eventos = detectarEventosDeConversas(statusAnteriores.current, conversas, avisarNovas);
        if (eventos.length) {
          const data = new Date().toISOString();
          setNotificacoes((atuais) => eventos.reduce(
            (lista, evento) => inserirNotificacao(lista, {
              ...evento,
              id: `notificacao-${novoId()}`,
              criadaEm: data,
              lida: false,
            }), atuais
          ));
        }
      }
    }
    statusAnteriores.current = estadosAtuais;
  }, [conversas, conversasProntas, notificacoesProntas, setNotificacoes]);

  useEffect(() => {
    if (!notificacoesProntas) return;
    try {
      const chave = "zyon-ultima-versao-notificada";
      if (localStorage.getItem(chave) === VERSAO_AVISO) return;
      localStorage.setItem(chave, VERSAO_AVISO);
      const preferencias = JSON.parse(localStorage.getItem("zyon-chat-preferencias") || "{}") as { notificacoes?: boolean };
      if (preferencias.notificacoes === false) return;
      setNotificacoes((atuais) => inserirNotificacao(atuais, {
        id: `atualizacao-${VERSAO_AVISO}`,
        tipo: "atualizacao",
        titulo: "Zyon Chat atualizado!",
        texto: "A central de notificações chegou: confira avisos de atendimentos, novas conversas e atualizações pelo sino.",
        criadaEm: new Date().toISOString(),
        lida: false,
      }));
    } catch { /* Sem armazenamento local, não cria avisos repetidos. */ }
  }, [notificacoesProntas, setNotificacoes]);
  const [ultimoResetIndicadores, setUltimoResetIndicadores] = usePersistido<number | null>("zyon-ultimo-reset-indicadores", null);
  const zerarIndicadores = () => {
    // Registrar o marco do reset é suficiente: as conversas continuam guardadas.
    const momento = Date.now();
    localStorage.setItem("zyon-ultimo-reset-indicadores", JSON.stringify(momento));
    setUltimoResetIndicadores(momento);
  };
  // Migra a escolha que já estava salva em Configurações antes da unificação.
  // A migração acontece uma única vez para não sobrescrever mudanças futuras no botão do cabeçalho.
  useEffect(() => {
    try {
      const migracao = "zyon-status-atendimento-unificado-v1";
      if (localStorage.getItem(migracao) === "1") return;
      const salvo = localStorage.getItem("zyon-chat-preferencias");
      if (salvo) {
        const preferencias = JSON.parse(salvo) as { respostasAutomaticas?: unknown };
        if (typeof preferencias.respostasAutomaticas === "boolean") {
          // Atualiza também o armazenamento antes de restaurar o estado React.
          localStorage.setItem("zyon-bot-ativo", JSON.stringify(preferencias.respostasAutomaticas));
          setBotAtivo(preferencias.respostasAutomaticas);
        }
      }
      localStorage.setItem(migracao, "1");
    } catch { /* Mantém o estado atual se as preferências antigas forem inválidas. */ }
  }, [setBotAtivo]);
  return <Ctx.Provider value={{ empresas, setEmpresas, produtos, setProdutos, salvarProdutos, horarios, setHorarios, faqs, setFaqs, instrucoes, setInstrucoes, empresaSelecionadaId, setEmpresaSelecionadaId, instrucoesPorEmpresa, setInstrucoesPorEmpresa, conversas, setConversas, respostasRapidas, setRespostasRapidas, botAtivo, setBotAtivo, ultimoResetIndicadores, zerarIndicadores, notificacoes, marcarNotificacao, marcarTodasNotificacoes, limparTodasNotificacoes }}>{children}</Ctx.Provider>;
}
export function useStore() { const s = useContext(Ctx); if (!s) throw new Error("StoreProvider ausente"); return s; }
export const novoId = () => Math.random().toString(36).slice(2, 9);
export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
