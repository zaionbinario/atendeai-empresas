# Zyon Chat — integração do Histórico de Conversas com WhatsApp

## Objetivo
Exibir na página existente `/conversas` as mensagens reais recebidas pela Evolution API e salvas no Supabase, sem apagar o histórico do simulador.

## Situação verificada no código
- `src/routes/conversas.tsx` usa atualmente `useStore().conversas`, com dados locais/de demonstração.
- `src/lib/types.ts` define tipos de demonstração, diferentes das colunas reais do Supabase.
- `src/integrations/supabase/client.ts` já fornece cliente Supabase com chave publicável; é arquivo gerado e **não deve ser editado**.
- O webhook existente não deve ser modificado nesta etapa.

## Requisitos de implementação
1. Ler `conversas`, `mensagens` e `whatsapp_instancias` com sessão autenticada, identificando a empresa por `empresa_usuarios`.
2. Mostrar contato, última mensagem, horário, status e histórico completo por conversa.
3. Atualizar dados via Supabase Realtime com fallback de recarregamento.
4. Preservar o histórico de demonstração, com separação visual clara das conversas reais.
5. Manter responsividade e identidade visual existentes.
6. Nesta etapa, conversas reais são **somente leitura**: não ativar envio, assumir/devolver ou respostas automáticas no WhatsApp.
7. Nunca colocar service role, segredos de webhook ou outras credenciais no frontend.
8. Não excluir registros existentes nem alterar a função webhook.

## Bloqueio de segurança antes de conectar dados reais
**Confirmar no banco real** a definição de `empresa_usuarios`, suas políticas e as políticas RLS de `conversas`, `mensagens` e `whatsapp_instancias`. A simples filtragem por `empresa_id` no navegador não isola dados entre empresas.

A política de leitura deverá verificar, no próprio PostgreSQL, se `auth.uid()` é membro da empresa vinculada ao registro. Em `mensagens`, também verificar o vínculo da conversa e empresa. Evitar recursão de políticas em `empresa_usuarios`. Verificar índices, privilégios e publicação do Realtime antes de habilitar a assinatura.

**Não executar SQL ainda.** Apresentar as instruções SQL exatas, adaptadas ao esquema e políticas reais, para revisão antes de aplicar qualquer migração.

## Testes de aceitação
- Cliente manda novas mensagens: uma conversa por contato/empresa/instância; várias mensagens na mesma conversa.
- Usuário da empresa A não consegue ler conversas da empresa B, nem via consultas diretas à API.
- Usuário sem sessão não lê mensagens.
- Histórico do simulador continua intacto e separado.
- Nenhuma ação da interface envia WhatsApp nesta fase.
- Uma mensagem nova aparece após atualização/realtime, sem duplicação.

## Próxima etapa
Após confirmar as políticas de acesso e aprovar o SQL necessário, implementar a camada de leitura no frontend e validar com uma conta de teste de outra empresa.
