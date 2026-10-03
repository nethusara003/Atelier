-- =====================================================================
-- ATELIER GALLERY — migration 002: provider-agnostic payment columns
-- Run this in the Supabase SQL editor AFTER supabase/schema.sql.
-- Adds generic payment columns so orders can be fulfilled via PayHere
-- (or any future provider) without overloading the stripe_* columns.
-- =====================================================================

alter table public.orders
  add column if not exists payment_provider text;

alter table public.orders
  add column if not exists payment_reference text;
