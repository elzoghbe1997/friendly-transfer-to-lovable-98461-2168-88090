-- Add fertilization_program_id column to revenues table
ALTER TABLE public.revenues 
ADD COLUMN fertilization_program_id uuid;

-- Add comment to describe the column
COMMENT ON COLUMN public.revenues.fertilization_program_id IS 'Reference to the fertilization program associated with this revenue/invoice';