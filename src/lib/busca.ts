export const destinosBusca = [
  { to: "/", titulo: "Painel", descricao: "Visão geral, indicadores e conversas na semana", palavras: "inicio dashboard resumo métricas estatísticas home" },
  { to: "/simulador", titulo: "Simulador", descricao: "Testar atendimento e respostas da IA", palavras: "teste testar bot chat conversar mensagens" },
  { to: "/conversas", titulo: "Histórico de conversas", descricao: "Ver mensagens, assumir atendimento e devolver para IA", palavras: "historico conversa mensagem atendimento atendimentos clientes manual humano" },
  { to: "/notificacoes", titulo: "Notificações", descricao: "Avisos, alertas e atualizações do sistema", palavras: "notificacao notificacoes notificações avisos alerta alertas sino atualizacoes atualizacao" },
  { to: "/respostas-rapidas", titulo: "Respostas rápidas", descricao: "Gerenciar mensagens prontas", palavras: "resposta respostas rapida rápidas atalhos texto mensagens" },
  { to: "/empresas", titulo: "Empresas", descricao: "Cadastrar e editar empresas", palavras: "empresa negocio negócios cadastro cadastrar lojas" },
  { to: "/produtos", titulo: "Produtos", descricao: "Gerenciar preços e produtos", palavras: "produto cardapio serviço servicos preços valores itens" },
  { to: "/horarios", titulo: "Horários", descricao: "Definir dias e horários de funcionamento", palavras: "horario expediente dias funcionamento abre fecha abertura" },
  { to: "/perguntas", titulo: "Perguntas frequentes", descricao: "Gerenciar FAQ e respostas da IA", palavras: "pergunta faq duvidas dúvida respostas frequentes" },
  { to: "/atendente", titulo: "Atendente virtual", descricao: "Personalizar o bot e as instruções", palavras: "inteligencia artificial bot agente instrucoes ai atendente" },
  { to: "/integracoes", titulo: "Integrações", descricao: "Conexões e WhatsApp", palavras: "integracao conectar whatsapp api conexoes" },
  { to: "/configuracoes", titulo: "Configurações", descricao: "Preferências, notificações e indicadores", palavras: "configuracao preferencias ajustes tema senha reset zerar" },
  { to: "/administracao", titulo: "Administração", descricao: "Gerenciar empresas na área com senha local", palavras: "administrar administrador administração gestao gestao de empresas senha admin" },
] as const;

export type DestinoBusca = (typeof destinosBusca)[number];

/** Busca local por páginas: remove acentos, aceita palavras parciais e aliases de navegação. */
export function normalizarBusca(valor: string): string {
  return valor.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ");
}

export function buscarPaginas(termo: string): DestinoBusca[] {
  const palavras = normalizarBusca(termo).split(" ").filter(Boolean);
  if (palavras.length === 0) return [...destinosBusca];

  return destinosBusca
    .map((destino) => {
      const titulo = normalizarBusca(destino.titulo);
      const descricao = normalizarBusca(destino.descricao);
      const aliases = normalizarBusca(destino.palavras);
      if (!palavras.every((palavra) =>
        titulo.includes(palavra) || descricao.includes(palavra) || aliases.includes(palavra)
      )) return null;
      const pontuacao = palavras.reduce((total, palavra) => total +
        (titulo.startsWith(palavra) ? 8 : titulo.includes(palavra) ? 6 : aliases.includes(palavra) ? 3 : 1), 0);
      return { destino, pontuacao };
    })
    .filter((item): item is { destino: DestinoBusca; pontuacao: number } => item !== null)
    .sort((a, b) => b.pontuacao - a.pontuacao)
    .map((item) => item.destino);
}
