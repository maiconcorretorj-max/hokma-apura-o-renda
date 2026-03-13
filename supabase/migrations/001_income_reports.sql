-- Criação da tabela de apuração de renda
CREATE TABLE IF NOT EXISTS public.income_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  cliente_nome text NOT NULL,
  cpf text,
  pdf_hash text NOT NULL,
  total_apurado bigint NOT NULL, -- em centavos
  media_mensal bigint NOT NULL,
  divisao_6 bigint NOT NULL,
  divisao_12 bigint NOT NULL,
  transacoes_json jsonb NOT NULL,
  versao_algoritmo text NOT NULL
);

-- Configura RLS (Row Level Security) para habilitar acesso anônimo para simplificar MVP
-- Num sistema real, usaríamos Auth e restrição por user_id
ALTER TABLE public.income_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users" ON public.income_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for all users" ON public.income_reports
  FOR SELECT USING (true);
