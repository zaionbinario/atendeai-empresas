// Estado compartilhado do painel. Persistência local de demonstração; backend será conectado depois.
import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import * as d from "./demo-data";
import type { Empresa, Produto, Horario, Faq, Instrucoes, Conversa } from "./types";

type Store = {
  empresas: Empresa[]; setEmpresas: (v: Empresa[]) => void;
  produtos: Produto[]; setProdutos: (v: Produto[]) => void;
  horarios: Horario[]; setHorarios: (v: Horario[]) => void;
  faqs: Faq[]; setFaqs: (v: Faq[]) => void;
  instrucoes: Instrucoes; setInstrucoes: (v: Instrucoes) => void;
  conversas: Conversa[]; setConversas: Dispatch<SetStateAction<Conversa[]>>;
  respostasRapidas: string[]; setRespostasRapidas: (v: string[]) => void;
  botAtivo: boolean; setBotAtivo: (v: boolean) => void;
  ultimoResetIndicadores: number | null; zerarIndicadores: () => void;
};
const Ctx = createContext<Store | null>(null);
function usePersistido<T>(chave: string, inicial: T): [T, Dispatch<SetStateAction<T>>] {
  const [valor, setValor] = useState<T>(inicial);
  const [pronto, setPronto] = useState(false);
  useEffect(() => {
    try { const salvo = localStorage.getItem(chave); if (salvo) setValor(JSON.parse(salvo) as T); } catch { /* mantém dados iniciais */ }
    setPronto(true);
  }, [chave]);
  useEffect(() => { if (pronto) { try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* armazenamento indisponível */ } } }, [chave, valor, pronto]);
  return [valor, setValor];
}
export function StoreProvider({ children }: { children: ReactNode }) {
  const [empresas, setEmpresas] = usePersistido("zyon-empresas", d.empresasDemo);
  const [produtos, setProdutos] = usePersistido("zyon-produtos", d.produtosDemo);
  const [horarios, setHorarios] = usePersistido("zyon-horarios", d.horariosDemo);
  const [faqs, setFaqs] = usePersistido("zyon-faqs", d.faqsDemo);
  const [instrucoes, setInstrucoes] = usePersistido("zyon-instrucoes", d.instrucoesDemo);
  const [conversas, setConversas] = usePersistido<Conversa[]>("zyon-conversas", []);
  const [respostasRapidas, setRespostasRapidas] = usePersistido<string[]>("zyon-respostas-rapidas", ["Olá! Como posso ajudar? 😊", "Só um momento, vou verificar essa informação.", "Obrigado pelo contato! Estamos à disposição."]);
  const [botAtivo, setBotAtivo] = usePersistido("zyon-bot-ativo", true);
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
  return <Ctx.Provider value={{ empresas, setEmpresas, produtos, setProdutos, horarios, setHorarios, faqs, setFaqs, instrucoes, setInstrucoes, conversas, setConversas, respostasRapidas, setRespostasRapidas, botAtivo, setBotAtivo, ultimoResetIndicadores, zerarIndicadores }}>{children}</Ctx.Provider>;
}
export function useStore() { const s = useContext(Ctx); if (!s) throw new Error("StoreProvider ausente"); return s; }
export const novoId = () => Math.random().toString(36).slice(2, 9);
export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
