-- Add missing household/housing/solar columns to surveys
ALTER TABLE public.surveys
  ADD COLUMN IF NOT EXISTS gharkul_received boolean,
  ADD COLUMN IF NOT EXISTS gharkul_wanted boolean,
  ADD COLUMN IF NOT EXISTS household_item_counts jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS solar_panel_installed boolean,
  ADD COLUMN IF NOT EXISTS solar_panel_wanted boolean;