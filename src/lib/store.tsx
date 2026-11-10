// Estado em memória com dados de demonstração.
// Futuro: substituir por consultas ao banco (Supabase) mantendo a mesma interface.
import { createContext, useContext, useState, type ReactNode } from "react";
import * as d from "./demo-data";
import type { Empresa, Produto, Horario, Faq, Instrucoes } from "./types";

type Store = {
  empresas: Empresa[]; setEmpresas: (v: Empresa[]) => void;
  produtos: Produto[]; setProdutos: (v: Produto[]) => void;
  horarios: Horario[]; setHorarios: (v: Horario[]) => void;
  faqs: Faq[]; setFaqs: (v: Faq[]) => void;
  instrucoes: Instrucoes; setInstrucoes: (v: Instrucoes) => void;
};
const Ctx = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [empresas, setEmpresas] = useState(d.empresasDemo);
  const [produtos, setProdutos] = useState(d.produtosDemo);
  const [horarios, setHorarios] = useState(d.horariosDemo);
  const [faqs, setFaqs] = useState(d.faqsDemo);
  const [instrucoes, setInstrucoes] = useState(d.instrucoesDemo);
  return <Ctx.Provider value={{ empresas, setEmpresas, produtos, setProdutos, horarios, setHorarios, faqs, setFaqs, instrucoes, setInstrucoes }}>{children}</Ctx.Provider>;
}
export function useStore() { const s = useContext(Ctx); if (!s) throw new Error("StoreProvider ausente"); return s; }
export const novoId = () => Math.random().toString(36).slice(2, 9);
export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
