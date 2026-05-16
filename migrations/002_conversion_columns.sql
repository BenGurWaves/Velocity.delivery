-- Migration: Add columns for Unified Conversion Screen (MSA + PaymentIntent)
-- Run this in Supabase SQL Editor BEFORE deploying new code.

ALTER TABLE public.velocity_leads ADD COLUMN IF NOT EXISTS msa_accepted_at timestamptz DEFAULT NULL;
ALTER TABLE public.velocity_leads ADD COLUMN IF NOT EXISTS msa_accepted_ip text DEFAULT NULL;
ALTER TABLE public.velocity_leads ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text DEFAULT NULL;
ALTER TABLE public.velocity_leads ADD COLUMN IF NOT EXISTS kickoff_date timestamptz DEFAULT NULL;
ALTER TABLE public.velocity_leads ADD COLUMN IF NOT EXISTS delivery_target_date timestamptz DEFAULT NULL;
ALTER TABLE public.velocity_leads ADD COLUMN IF NOT EXISTS company_stage text DEFAULT NULL;
ALTER TABLE public.velocity_leads ADD COLUMN IF NOT EXISTS competitor_benchmarks text DEFAULT NULL;
ALTER TABLE public.velocity_leads ADD COLUMN IF NOT EXISTS copy_readiness text DEFAULT NULL;
ALTER TABLE public.velocity_leads ADD COLUMN IF NOT EXISTS visual_typography_scale integer DEFAULT NULL;
ALTER TABLE public.velocity_leads ADD COLUMN IF NOT EXISTS visual_layout_density integer DEFAULT NULL;
ALTER TABLE public.velocity_leads ADD COLUMN IF NOT EXISTS visual_chromatographic integer DEFAULT NULL;
