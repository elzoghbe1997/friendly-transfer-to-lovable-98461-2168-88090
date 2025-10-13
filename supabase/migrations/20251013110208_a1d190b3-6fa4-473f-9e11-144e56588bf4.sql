-- Create farmer_withdrawals table
CREATE TABLE IF NOT EXISTS public.farmer_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create supplier_payments table
CREATE TABLE IF NOT EXISTS public.supplier_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  notes TEXT,
  linked_expense_ids JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create revenues table for tracking revenue transactions
CREATE TABLE IF NOT EXISTS public.revenues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  quantity NUMERIC,
  price_items JSONB,
  discount NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on farmer_withdrawals
ALTER TABLE public.farmer_withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own farmer withdrawals"
ON public.farmer_withdrawals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own farmer withdrawals"
ON public.farmer_withdrawals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farmer withdrawals"
ON public.farmer_withdrawals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farmer withdrawals"
ON public.farmer_withdrawals FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on supplier_payments
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own supplier payments"
ON public.supplier_payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own supplier payments"
ON public.supplier_payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplier payments"
ON public.supplier_payments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplier payments"
ON public.supplier_payments FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on revenues
ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own revenues"
ON public.revenues FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own revenues"
ON public.revenues FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revenues"
ON public.revenues FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revenues"
ON public.revenues FOR DELETE
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_farmer_withdrawals_updated_at
BEFORE UPDATE ON public.farmer_withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_payments_updated_at
BEFORE UPDATE ON public.supplier_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revenues_updated_at
BEFORE UPDATE ON public.revenues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add missing columns to expenses table to match Transaction type
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS quantity NUMERIC,
ADD COLUMN IF NOT EXISTS price_items JSONB,
ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS fertilization_program_id UUID REFERENCES public.fertilization_programs(id) ON DELETE SET NULL;