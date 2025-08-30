-- Fuel Quality Data Table
CREATE TABLE IF NOT EXISTS public.fuel_quality_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  port VARCHAR(255) NOT NULL,
  supplier VARCHAR(255),
  date DATE,
  fuel_type VARCHAR(100),
  grade VARCHAR(100),
  density_15c DECIMAL(10,4),
  k_viscosity_50c DECIMAL(10,4),
  flash_point DECIMAL(10,4),
  pour_point DECIMAL(10,4),
  mcr DECIMAL(10,4),
  ash DECIMAL(10,4),
  water_content DECIMAL(10,4),
  sulphur_content DECIMAL(10,4),
  total_sediment DECIMAL(10,4),
  vanadium DECIMAL(10,4),
  sodium DECIMAL(10,4),
  aluminium DECIMAL(10,4),
  silicon DECIMAL(10,4),
  aluminium_silicon DECIMAL(10,4),
  calcium DECIMAL(10,4),
  phosphorus DECIMAL(10,4),
  zinc DECIMAL(10,4),
  iron DECIMAL(10,4),
  nickel DECIMAL(10,4),
  lead DECIMAL(10,4),
  potassium DECIMAL(10,4),
  ccai DECIMAL(10,4),
  net_specific_energy DECIMAL(10,4),
  gross_specific_energy DECIMAL(10,4),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fuel_quality_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "fuel_quality_data_read" ON public.fuel_quality_data
  FOR SELECT TO authenticated USING (
    public.has_role_on_account(account_id)
  );

CREATE POLICY "fuel_quality_data_insert" ON public.fuel_quality_data
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role_on_account(account_id)
  );

CREATE POLICY "fuel_quality_data_update" ON public.fuel_quality_data
  FOR UPDATE TO authenticated USING (
    public.has_role_on_account(account_id)
  ) WITH CHECK (
    public.has_role_on_account(account_id)
  );

CREATE POLICY "fuel_quality_data_delete" ON public.fuel_quality_data
  FOR DELETE TO authenticated USING (
    public.has_role_on_account(account_id)
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fuel_quality_data_account_id ON public.fuel_quality_data(account_id);
CREATE INDEX IF NOT EXISTS idx_fuel_quality_data_port ON public.fuel_quality_data(port);
CREATE INDEX IF NOT EXISTS idx_fuel_quality_data_date ON public.fuel_quality_data(date);

-- Triggers
CREATE TRIGGER trigger_set_timestamps
  BEFORE UPDATE ON public.fuel_quality_data
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamps();

CREATE TRIGGER trigger_set_user_tracking
  BEFORE INSERT OR UPDATE ON public.fuel_quality_data
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_user_tracking();
