/*
 * -------------------------------------------------------
 * Section: Fuel Manager
 * Fuel price prediction, supply-demand data, and fuel management
 * -------------------------------------------------------
 */

-- Fuel types enum
CREATE TYPE public.fuel_type AS ENUM (
  'diesel',
  'gasoline',
  'heavy_fuel_oil',
  'marine_gas_oil',
  'liquefied_natural_gas'
);

-- Fuel quality data
CREATE TABLE IF NOT EXISTS public.fuel_quality_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  fuel_type public.fuel_type NOT NULL,
  sulfur_content DECIMAL(5,2),
  density DECIMAL(6,3),
  viscosity DECIMAL(6,2),
  flash_point DECIMAL(5,1),
  pour_point DECIMAL(5,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Ports
CREATE TABLE IF NOT EXISTS public.ports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Port fuel quality index
CREATE TABLE IF NOT EXISTS public.port_fuel_quality_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  port_id UUID REFERENCES public.ports(id) ON DELETE CASCADE NOT NULL,
  fuel_type public.fuel_type NOT NULL,
  quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 10),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Ships
CREATE TABLE IF NOT EXISTS public.ships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  imo_number VARCHAR(10) UNIQUE,
  vessel_type VARCHAR(100),
  capacity DECIMAL(10,2),
  fuel_consumption_rate DECIMAL(8,2),
  fuel_types TEXT NOT NULL DEFAULT 'HFO,VLSFO,ULSFO',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add comment to explain the fuel_types column
COMMENT ON COLUMN public.ships.fuel_types IS 'Comma-separated list of fuel types (HFO, VLSFO, ULSFO)';

-- Create a check constraint to ensure valid fuel types
ALTER TABLE public.ships 
ADD CONSTRAINT ships_fuel_types_check 
CHECK (
  fuel_types ~ '^(HFO|VLSFO|ULSFO)(,(HFO|VLSFO|ULSFO))*$'
);

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Fuel inventory
CREATE TABLE IF NOT EXISTS public.fuel_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  fuel_type public.fuel_type NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2),
  location VARCHAR(255),
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Supply and demand data
CREATE TABLE IF NOT EXISTS public.supply_and_demand_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  saudi_production_change DECIMAL(10,4),
  wti_production_change DECIMAL(10,4),
  spare_capacity DECIMAL(10,4),
  wti_gdp_deflated DECIMAL(10,4),
  capacity_percent_change DECIMAL(10,4),
  world_gdp_change DECIMAL(10,4),
  non_opec_production_change DECIMAL(10,4),
  opec_disruption DECIMAL(10,4),
  non_opec_disruption DECIMAL(10,4),
  nat_gas DECIMAL(10,4),
  gold DECIMAL(10,4),
  copper DECIMAL(10,4),
  silver DECIMAL(10,4),
  soy DECIMAL(10,4),
  corn DECIMAL(10,4),
  wheat DECIMAL(10,4),
  sp_500 DECIMAL(10,4),
  dxy DECIMAL(10,4),
  treasury DECIMAL(10,4),
  treasury_tips_inflation_rate DECIMAL(10,4),
  crude_oil_implied_volatility DECIMAL(10,4),
  open_interest DECIMAL(10,4),
  money_managers_long DECIMAL(10,4),
  money_managers_short DECIMAL(10,4),
  money_managers_net DECIMAL(10,4),
  producers_merchants_long DECIMAL(10,4),
  producers_merchants_short DECIMAL(10,4),
  yoy_oedc_consumption_change DECIMAL(10,4),
  world_consumption_change DECIMAL(10,4),
  non_oecd_consumption_growth DECIMAL(10,4),
  inventory_change DECIMAL(10,4),
  spread_change DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Procurement decisions
CREATE TABLE IF NOT EXISTS public.procurement_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  decision_date DATE NOT NULL,
  fuel_type public.fuel_type NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2),
  supplier VARCHAR(255),
  decision_reason TEXT,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Price prediction files (using storage instead of byte arrays)
CREATE TABLE IF NOT EXISTS public.price_prediction_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  storage_key VARCHAR(500) NOT NULL, -- Supabase Storage key
  file_size BIGINT,
  content_type VARCHAR(100),
  predictions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  is_processed BOOLEAN DEFAULT false,
  processing_status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fuel_quality_data_account_id ON public.fuel_quality_data(account_id);
CREATE INDEX IF NOT EXISTS idx_ports_account_id ON public.ports(account_id);
CREATE INDEX IF NOT EXISTS idx_port_fuel_quality_index_account_id ON public.port_fuel_quality_index(account_id);
CREATE INDEX IF NOT EXISTS idx_ships_account_id ON public.ships(account_id);
CREATE INDEX IF NOT EXISTS idx_customers_account_id ON public.customers(account_id);
CREATE INDEX IF NOT EXISTS idx_fuel_inventory_account_id ON public.fuel_inventory(account_id);
CREATE INDEX IF NOT EXISTS idx_supply_demand_data_account_id ON public.supply_and_demand_data(account_id);
CREATE INDEX IF NOT EXISTS idx_procurement_decisions_account_id ON public.procurement_decisions(account_id);
CREATE INDEX IF NOT EXISTS idx_price_prediction_files_account_id ON public.price_prediction_files(account_id);
CREATE INDEX IF NOT EXISTS idx_price_prediction_files_active ON public.price_prediction_files(is_active) WHERE is_active = true;

-- Enable RLS on all tables
ALTER TABLE public.fuel_quality_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.port_fuel_quality_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_and_demand_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_prediction_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fuel_quality_data
CREATE POLICY "fuel_quality_data_read" ON public.fuel_quality_data
  FOR SELECT USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "fuel_quality_data_insert" ON public.fuel_quality_data
  FOR INSERT WITH CHECK (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "fuel_quality_data_update" ON public.fuel_quality_data
  FOR UPDATE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "fuel_quality_data_delete" ON public.fuel_quality_data
  FOR DELETE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

-- RLS Policies for ports
CREATE POLICY "ports_read" ON public.ports
  FOR SELECT USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "ports_insert" ON public.ports
  FOR INSERT WITH CHECK (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "ports_update" ON public.ports
  FOR UPDATE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "ports_delete" ON public.ports
  FOR DELETE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

-- RLS Policies for port_fuel_quality_index
CREATE POLICY "port_fuel_quality_index_read" ON public.port_fuel_quality_index
  FOR SELECT USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "port_fuel_quality_index_insert" ON public.port_fuel_quality_index
  FOR INSERT WITH CHECK (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "port_fuel_quality_index_update" ON public.port_fuel_quality_index
  FOR UPDATE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "port_fuel_quality_index_delete" ON public.port_fuel_quality_index
  FOR DELETE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

-- RLS Policies for ships
CREATE POLICY "ships_read" ON public.ships
  FOR SELECT USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "ships_insert" ON public.ships
  FOR INSERT WITH CHECK (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "ships_update" ON public.ships
  FOR UPDATE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "ships_delete" ON public.ships
  FOR DELETE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

-- RLS Policies for customers
CREATE POLICY "customers_read" ON public.customers
  FOR SELECT USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "customers_insert" ON public.customers
  FOR INSERT WITH CHECK (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "customers_update" ON public.customers
  FOR UPDATE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "customers_delete" ON public.customers
  FOR DELETE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

-- RLS Policies for fuel_inventory
CREATE POLICY "fuel_inventory_read" ON public.fuel_inventory
  FOR SELECT USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "fuel_inventory_insert" ON public.fuel_inventory
  FOR INSERT WITH CHECK (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "fuel_inventory_update" ON public.fuel_inventory
  FOR UPDATE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "fuel_inventory_delete" ON public.fuel_inventory
  FOR DELETE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

-- RLS Policies for supply_and_demand_data
CREATE POLICY "supply_and_demand_data_read" ON public.supply_and_demand_data
  FOR SELECT USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "supply_and_demand_data_insert" ON public.supply_and_demand_data
  FOR INSERT WITH CHECK (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "supply_and_demand_data_update" ON public.supply_and_demand_data
  FOR UPDATE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "supply_and_demand_data_delete" ON public.supply_and_demand_data
  FOR DELETE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

-- RLS Policies for procurement_decisions
CREATE POLICY "procurement_decisions_read" ON public.procurement_decisions
  FOR SELECT USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "procurement_decisions_insert" ON public.procurement_decisions
  FOR INSERT WITH CHECK (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "procurement_decisions_update" ON public.procurement_decisions
  FOR UPDATE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "procurement_decisions_delete" ON public.procurement_decisions
  FOR DELETE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

-- RLS Policies for price_prediction_files
CREATE POLICY "price_prediction_files_read" ON public.price_prediction_files
  FOR SELECT USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "price_prediction_files_insert" ON public.price_prediction_files
  FOR INSERT WITH CHECK (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "price_prediction_files_update" ON public.price_prediction_files
  FOR UPDATE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

CREATE POLICY "price_prediction_files_delete" ON public.price_prediction_files
  FOR DELETE USING (
    account_id = (SELECT auth.uid()) OR
    public.has_role_on_account(account_id)
  );

-- Add triggers for timestamps and user tracking
CREATE TRIGGER trigger_fuel_quality_data_timestamps
  BEFORE INSERT OR UPDATE ON public.fuel_quality_data
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamps();

CREATE TRIGGER trigger_fuel_quality_data_user_tracking
  BEFORE INSERT OR UPDATE ON public.fuel_quality_data
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_user_tracking();

CREATE TRIGGER trigger_ports_timestamps
  BEFORE INSERT OR UPDATE ON public.ports
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamps();

CREATE TRIGGER trigger_ports_user_tracking
  BEFORE INSERT OR UPDATE ON public.ports
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_user_tracking();

CREATE TRIGGER trigger_port_fuel_quality_index_timestamps
  BEFORE INSERT OR UPDATE ON public.port_fuel_quality_index
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamps();

CREATE TRIGGER trigger_port_fuel_quality_index_user_tracking
  BEFORE INSERT OR UPDATE ON public.port_fuel_quality_index
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_user_tracking();

CREATE TRIGGER trigger_ships_timestamps
  BEFORE INSERT OR UPDATE ON public.ships
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamps();

CREATE TRIGGER trigger_ships_user_tracking
  BEFORE INSERT OR UPDATE ON public.ships
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_user_tracking();

CREATE TRIGGER trigger_customers_timestamps
  BEFORE INSERT OR UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamps();

CREATE TRIGGER trigger_customers_user_tracking
  BEFORE INSERT OR UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_user_tracking();

CREATE TRIGGER trigger_fuel_inventory_timestamps
  BEFORE INSERT OR UPDATE ON public.fuel_inventory
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamps();

CREATE TRIGGER trigger_fuel_inventory_user_tracking
  BEFORE INSERT OR UPDATE ON public.fuel_inventory
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_user_tracking();

CREATE TRIGGER trigger_supply_and_demand_data_timestamps
  BEFORE INSERT OR UPDATE ON public.supply_and_demand_data
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamps();

CREATE TRIGGER trigger_supply_and_demand_data_user_tracking
  BEFORE INSERT OR UPDATE ON public.supply_and_demand_data
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_user_tracking();

CREATE TRIGGER trigger_procurement_decisions_timestamps
  BEFORE INSERT OR UPDATE ON public.procurement_decisions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamps();

CREATE TRIGGER trigger_procurement_decisions_user_tracking
  BEFORE INSERT OR UPDATE ON public.procurement_decisions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_user_tracking();

CREATE TRIGGER trigger_price_prediction_files_timestamps
  BEFORE INSERT OR UPDATE ON public.price_prediction_files
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamps();

CREATE TRIGGER trigger_price_prediction_files_user_tracking
  BEFORE INSERT OR UPDATE ON public.price_prediction_files
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_user_tracking();

-- Grant permissions
GRANT ALL ON public.fuel_quality_data TO authenticated;
GRANT ALL ON public.ports TO authenticated;
GRANT ALL ON public.port_fuel_quality_index TO authenticated;
GRANT ALL ON public.ships TO authenticated;
GRANT ALL ON public.customers TO authenticated;
GRANT ALL ON public.fuel_inventory TO authenticated;
GRANT ALL ON public.supply_and_demand_data TO authenticated;
GRANT ALL ON public.procurement_decisions TO authenticated;
GRANT ALL ON public.price_prediction_files TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
