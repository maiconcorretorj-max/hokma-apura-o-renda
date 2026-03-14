-- ============================================================
-- HOKMA — Schema Completo v1.0
-- Execute INTEIRO no Supabase Dashboard > SQL Editor
-- ============================================================

-- ── 1. PROFILES ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  full_name  text,
  email      text,
  plan       text        DEFAULT 'free' CHECK (plan IN ('free','pro','enterprise'))
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger: criar perfil automaticamente ao registrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 2. INCOME REPORTS ──────────────────────────────────────
-- Drop e recria com user_id + campos extras

DROP TABLE IF EXISTS public.income_reports CASCADE;

CREATE TABLE public.income_reports (
  id                     uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at             timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  user_id                uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cliente_nome           text        NOT NULL,
  cpf                    text,
  pdf_hash               text        NOT NULL,
  pdf_storage_path       text,
  total_apurado          bigint      NOT NULL DEFAULT 0,
  media_mensal           bigint      NOT NULL DEFAULT 0,
  divisao_6              bigint      NOT NULL DEFAULT 0,
  divisao_12             bigint      NOT NULL DEFAULT 0,
  maior_mes              bigint      DEFAULT 0,
  menor_mes              bigint      DEFAULT 0,
  meses_considerados     integer     DEFAULT 0,
  transacoes_json        jsonb       NOT NULL DEFAULT '[]',
  versao_algoritmo       text        NOT NULL DEFAULT '3.0.0-interactive',
  timestamp_processamento timestamptz DEFAULT now()
);

ALTER TABLE public.income_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select_own" ON public.income_reports
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reports_insert_own" ON public.income_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reports_delete_own" ON public.income_reports
  FOR DELETE USING (auth.uid() = user_id);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_income_reports_user_id    ON public.income_reports (user_id);
CREATE INDEX IF NOT EXISTS idx_income_reports_pdf_hash   ON public.income_reports (pdf_hash);
CREATE INDEX IF NOT EXISTS idx_income_reports_created_at ON public.income_reports (created_at DESC);

-- ── 3. AUDIT LOGS ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  user_id    uuid        REFERENCES auth.users(id)        ON DELETE SET NULL,
  report_id  uuid        REFERENCES public.income_reports(id) ON DELETE SET NULL,
  action     text        NOT NULL CHECK (action IN ('upload','process','save','delete','view','hash_duplicate')),
  pdf_hash   text,
  metadata   jsonb       DEFAULT '{}'
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_select_own" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "audit_insert_own" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs (user_id);

-- ── 4. STORAGE — bucket pdfs ───────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pdfs', 'pdfs', false, 15728640, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "storage_select_own" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_own" ON storage.objects;

CREATE POLICY "storage_select_own" ON storage.objects
  FOR SELECT USING (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "storage_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "storage_delete_own" ON storage.objects
  FOR DELETE USING (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ── 5. FUNCTIONS ───────────────────────────────────────────

-- Verificar PDF duplicado por hash
CREATE OR REPLACE FUNCTION public.check_pdf_hash(p_hash text, p_user_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  existing record;
BEGIN
  SELECT id, created_at, cliente_nome, total_apurado
  INTO existing
  FROM public.income_reports
  WHERE pdf_hash = p_hash AND user_id = p_user_id
  LIMIT 1;

  IF FOUND THEN
    RETURN json_build_object(
      'exists',       true,
      'report_id',    existing.id,
      'created_at',   existing.created_at,
      'cliente_nome', existing.cliente_nome,
      'total_apurado', existing.total_apurado
    );
  ELSE
    RETURN json_build_object('exists', false);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_pdf_hash TO anon, authenticated;

-- Estatísticas do usuário
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id uuid DEFAULT auth.uid())
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_reports',        COUNT(*),
    'total_apurado_geral',  COALESCE(SUM(total_apurado), 0),
    'media_media_mensal',   COALESCE(AVG(media_mensal)::bigint, 0),
    'ultimo_relatorio',     MAX(created_at),
    'clientes_distintos',   COUNT(DISTINCT cliente_nome)
  )
  INTO result
  FROM public.income_reports
  WHERE user_id = COALESCE(p_user_id, auth.uid());

  RETURN COALESCE(result, '{"total_reports":0,"total_apurado_geral":0,"media_media_mensal":0}'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_stats TO authenticated;

-- ── FIM DO SCHEMA ──────────────────────────────────────────
