ALTER TABLE public.surveys
  ADD COLUMN IF NOT EXISTS marriage_type text,
  ADD COLUMN IF NOT EXISTS spouse_caste text;