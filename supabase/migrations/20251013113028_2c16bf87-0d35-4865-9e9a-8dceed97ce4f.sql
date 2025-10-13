-- Add missing fields to greenhouses table
ALTER TABLE public.greenhouses 
ADD COLUMN IF NOT EXISTS creation_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS initial_cost NUMERIC(12,2) DEFAULT 0;