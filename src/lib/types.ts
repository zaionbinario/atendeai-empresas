// Tipos de domínio — espelham as futuras tabelas do banco de dados.
export type Empresa = { id: string; nome: string; segmento: string; telefone: string; cidade: string; ativa: boolean };
export type Produto = { id: string; nome: string; preco: number; descricao: string; categoria: string };
export type Horario = { dia: string; aberto: boolean; abre: string; fecha: string };
export type Faq = { id: string; pergunta: string; resposta: string };
export type Instrucoes = { nomeAtendente: string; tom: "amigavel" | "formal" | "descontraido"; boasVindas: string; regras: string; transferirHumano: boolean };
export type Mensagem = { id: string; de: "cliente" | "bot" | "humano"; texto: string; hora: string; enviadaEm?: string };

export type Conversa = { id: string; cliente: string; ultimaMensagem: string; atualizadaEm: string; status: "ia" | "humano" | "resolvida"; mensagens: Mensagem[]; ultimaAtividadeEm?: string };
