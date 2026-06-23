ALTER TABLE public.surveys
  ADD COLUMN IF NOT EXISTS irrigated_area text,
  ADD COLUMN IF NOT EXISTS dryland_area text,
  ADD COLUMN IF NOT EXISTS kharif_area text,
  ADD COLUMN IF NOT EXISTS rabi_area text,
  ADD COLUMN IF NOT EXISTS summer_area text,
  ADD COLUMN IF NOT EXISTS major_crop_types text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS major_crop_types_other text;