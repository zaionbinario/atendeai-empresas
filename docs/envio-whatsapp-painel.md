# Envio de respostas reais pelo painel — Zyon Chat

## Estado atual
A página `src/routes/conversas.tsx` já exibe a aba WhatsApp real por meio de `src/components/app/HistoricoWhatsapp.tsx`. Essa aba lê `conversas` e `mensagens` do Supabase e **ainda não envia respostas**. O botão de resposta do simulador não envia mensagens reais.

## Implementação necessária
1. Criar uma Edge Function autenticada para envio de mensagens, recebendo somente `conversa_id` e texto (limite de tamanho e validação). A função deve identificar o usuário via JWT e verificar no banco sua associação à empresa da conversa. Nunca confiar em `empresa_id`, número ou instância enviados pelo navegador.
2. Resolver no banco a instância WhatsApp vinculada à conversa; obter URL da Evolution API e credenciais de Secrets do servidor, nunca do frontend.
3. Enviar a mensagem à Evolution API por canal seguro. A Evolution API atualmente está no Docker local: a função hospedada não pode usar `localhost` para alcançá-la. Preparar um endpoint HTTPS protegido ou hospedar a API antes de habilitar o envio real.
4. Registrar mensagem de saída apenas após confirmação da API, com ID externo e tratamento de repetição/falha. Garantir que o webhook não duplique a mensagem enviada.
5. Só então habilitar campo de texto e botão **Enviar pelo WhatsApp** na aba real; mostrar estado de envio, sucesso e erro. Preservar separação da aba Simulador.
6. Antes de ativar envio automático por IA, implementar controle de atendimento humano, estado persistente por conversa e mecanismo para impedir que IA responda enquanto o humano assumiu.

## Segurança e testes
- Confirmar RLS de `empresa_usuarios`, `conversas`, `mensagens` e `whatsapp_instancias`; usuário da empresa A nunca pode enviar pela empresa B.
- Não publicar `SUPABASE_SERVICE_ROLE_KEY`, `ZYON_WEBHOOK_SECRET` nem API key da Evolution no navegador ou repositório.
- Testar envio real com um número autorizado, falha de conexão, mensagem duplicada, reinício do Docker e sessão expirada.
- Não alterar o webhook receptor que já funciona sem teste de regressão.

**Status:** planejamento salvo no GitHub; implementação de envio real ainda pendente. Não apresentar a interface como funcional antes do teste ponta a ponta.
