-- Add farmer relationship fields to crop_cycles table
ALTER TABLE public.crop_cycles 
ADD COLUMN IF NOT EXISTS farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS farmer_share_percentage NUMERIC(5,2);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_crop_cycles_farmer_id ON public.crop_cycles(farmer_id);