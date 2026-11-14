-- Execute no SQL Editor antes de publicar o webhook.
-- Sandbox compartilhado: somente uma empresa de teste por número de destino.
CREATE TABLE IF NOT EXISTS public.whatsapp_canais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  provedor text NOT NULL DEFAULT 'twilio' CHECK (provedor = 'twilio'),
  numero_destino text NOT NULL UNIQUE,
  ambiente text NOT NULL DEFAULT 'sandbox' CHECK (ambiente IN ('sandbox','producao')),
  ativo boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.whatsapp_canais ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.whatsapp_canais FROM PUBLIC, anon, authenticated;
-- Somente backend com service_role gerencia a vinculação. Não inserir segredos aqui.
-- Após obter o UUID da Pizzaria do Pedro, executar separadamente:
-- INSERT INTO public.whatsapp_canais (empresa_id,numero_destino,ambiente,ativo)
-- VALUES ('UUID_DA_PIZZARIA', 'whatsapp:+14155238886', 'sandbox', true)
-- ON CONFLICT (numero_destino) DO UPDATE SET empresa_id = EXCLUDED.empresa_id, ativo = true;
