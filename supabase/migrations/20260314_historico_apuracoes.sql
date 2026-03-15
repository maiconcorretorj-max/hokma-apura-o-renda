-- Tabela de histórico de apurações
CREATE TABLE IF NOT EXISTS public.historico_apuracoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome_cliente TEXT NOT NULL,
  cpf TEXT DEFAULT '',
  banco TEXT DEFAULT '',
  periodo_inicio TEXT DEFAULT '',
  periodo_fim TEXT DEFAULT '',
  renda_total NUMERIC(15,2) DEFAULT 0,
  total_transacoes INTEGER DEFAULT 0,
  hash_pdf TEXT DEFAULT '',
  resultado_json JSONB NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_historico_user_id ON public.historico_apuracoes(user_id);
CREATE INDEX IF NOT EXISTS idx_historico_criado_em ON public.historico_apuracoes(criado_em DESC);

-- RLS: cada usuário vê apenas seus próprios registros
ALTER TABLE public.historico_apuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_history" ON public.historico_apuracoes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
