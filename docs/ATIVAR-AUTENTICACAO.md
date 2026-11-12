# Ativar autenticação real — Zyon Chat

1. No Lovable (variáveis de ambiente do projeto), configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (ou a chave pública publishable, conforme o projeto). **Nunca** coloque `service_role` ou chave secreta no frontend.
2. No Supabase, abra SQL Editor e execute `supabase/migrations/20261112_perfis_auth.sql` no **projeto correto**. Revise antes de executar, especialmente se já houver tabela `perfis`.
3. Em Authentication > URL Configuration, configure a URL pública do app e os Redirect URLs para `https://SEU-DOMINIO/**` (incluindo URLs de preview autorizadas). Verifique os modelos de e-mail e SMTP para envio em produção.
4. Em Authentication > Providers > Email, habilite cadastro e confirmação por e-mail conforme necessário.
5. Execute build, teste cadastro, confirmação, login, reload, logout, redefinição de senha e tentativa de acesso ao dashboard sem sessão.
6. Verifique RLS em **todas** as tabelas de negócio existentes, como `empresas`, `empresa_usuarios` e `admins_plataforma`. Esta migração protege **apenas** `perfis`. Não considere os dados empresariais isolados até concluir as políticas e mover os dados de demonstração do localStorage para tabelas com RLS.
7. O Dashboard atual continua sendo uma visão de demonstração com dados locais, não dados pessoais/empresariais isolados. A rota é privada no cliente, mas proteção real dos dados exige autorização no banco.
