-- Dedicated row for GitHub Actions PostgREST heartbeat (anon SELECT, no sensitive data).

CREATE TABLE IF NOT EXISTS public.supabase_heartbeat_probe (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.supabase_heartbeat_probe (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.supabase_heartbeat_probe ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon read heartbeat probe" ON public.supabase_heartbeat_probe;
CREATE POLICY "Anon read heartbeat probe"
  ON public.supabase_heartbeat_probe
  FOR SELECT
  TO anon
  USING (true);

GRANT SELECT ON public.supabase_heartbeat_probe TO anon, authenticated;