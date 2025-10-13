-- Add startDate and endDate columns to fertilization_programs table
ALTER TABLE public.fertilization_programs 
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE;

-- Update existing records to have default dates if needed
UPDATE public.fertilization_programs 
SET start_date = CURRENT_DATE,
    end_date = CURRENT_DATE + INTERVAL '30 days'
WHERE start_date IS NULL;