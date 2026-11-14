-- Zyon Chat: dados privados por empresa (execute no SQL Editor do Supabase).
-- Não apaga dados existentes. Cada seção é um documento JSONB por empresa.
CREATE TABLE IF NOT EXISTS public.empresa_dados (
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  secao text NOT NULL CHECK (secao IN ('produtos','horarios','faqs','instrucoes','conversas','respostas_rapidas','configuracoes')),
  conteudo jsonb NOT NULL DEFAULT '[]'::jsonb,
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, secao)
);

ALTER TABLE public.empresa_dados ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.empresa_dados FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.empresa_dados TO authenticated;

-- SECURITY DEFINER para verificar o vínculo sem depender das políticas
-- da tabela de dados e evitar acesso cruzado entre empresas.
CREATE OR REPLACE FUNCTION public.pode_acessar_dados_empresa(p_empresa_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.empresa_usuarios eu
    JOIN public.empresas e ON e.id = eu.empresa_id
    WHERE eu.empresa_id = p_empresa_id
      AND eu.usuario_id = (SELECT auth.uid())
      AND e.status = 'ativa'
  );
$$;
REVOKE ALL ON FUNCTION public.pode_acessar_dados_empresa(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pode_acessar_dados_empresa(uuid) TO authenticated;

DROP POLICY IF EXISTS "Membros ativos leem dados" ON public.empresa_dados;
CREATE POLICY "Membros ativos leem dados" ON public.empresa_dados
FOR SELECT TO authenticated
USING (public.pode_acessar_dados_empresa(empresa_id));

DROP POLICY IF EXISTS "Donos ativos criam dados" ON public.empresa_dados;
CREATE POLICY "Donos ativos criam dados" ON public.empresa_dados
FOR INSERT TO authenticated
WITH CHECK (
  public.pode_acessar_dados_empresa(empresa_id)
  AND EXISTS (
    SELECT 1 FROM public.empresa_usuarios eu
    WHERE eu.empresa_id = empresa_dados.empresa_id
      AND eu.usuario_id = (SELECT auth.uid()) AND eu.papel = 'dono'
  )
);

DROP POLICY IF EXISTS "Donos ativos alteram dados" ON public.empresa_dados;
CREATE POLICY "Donos ativos alteram dados" ON public.empresa_dados
FOR UPDATE TO authenticated
USING (
  public.pode_acessar_dados_empresa(empresa_id)
  AND EXISTS (
    SELECT 1 FROM public.empresa_usuarios eu
    WHERE eu.empresa_id = empresa_dados.empresa_id
      AND eu.usuario_id = (SELECT auth.uid()) AND eu.papel = 'dono'
  )
)
WITH CHECK (
  public.pode_acessar_dados_empresa(empresa_id)
  AND EXISTS (
    SELECT 1 FROM public.empresa_usuarios eu
    WHERE eu.empresa_id = empresa_dados.empresa_id
      AND eu.usuario_id = (SELECT auth.uid()) AND eu.papel = 'dono'
  )
);

DROP POLICY IF EXISTS "Donos ativos excluem dados" ON public.empresa_dados;
CREATE POLICY "Donos ativos excluem dados" ON public.empresa_dados
FOR DELETE TO authenticated
USING (
  public.pode_acessar_dados_empresa(empresa_id)
  AND EXISTS (
    SELECT 1 FROM public.empresa_usuarios eu
    WHERE eu.empresa_id = empresa_dados.empresa_id
      AND eu.usuario_id = (SELECT auth.uid()) AND eu.papel = 'dono'
  )
);
