-- Fuel Manager Schema Migration
-- This migration only creates new objects without modifying existing ones

-- Create fuel type enum
create type "public"."fuel_type" as enum ('diesel', 'gasoline', 'heavy_fuel_oil', 'marine_gas_oil', 'liquefied_natural_gas');

-- Create customers table
create table "public"."customers" (
    "id" uuid not null default gen_random_uuid(),
    "account_id" uuid not null,
  "name" text not null,
  "email" text,
  "phone" text,
  "address" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
  "created_by" uuid not null,
  "updated_by" uuid not null
);

-- Create fuel inventory table
create table "public"."fuel_inventory" (
    "id" uuid not null default gen_random_uuid(),
    "account_id" uuid not null,
    "ship_id" uuid not null,
    "fuel_type" text not null,
    "rob" numeric(10,2),
    "me" numeric(10,2),
    "ae" numeric(10,2),
    "boiler" numeric(10,2),
    "max_fuel_capacity" numeric(10,2),
    "min_fuel_policy" numeric(10,2),
    "average_voyage_period" numeric(10,2),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "created_by" uuid not null,
    "updated_by" uuid not null
);

-- Create fuel quality data table
create table "public"."fuel_quality_data" (
    "id" uuid not null default gen_random_uuid(),
    "account_id" uuid not null,
    "port" text,
    "supplier" text,
    "date" date,
    "fuel_type" text,
    "grade" text,
    "density_fifteen_c" numeric(7,2),
    "k_viscosity_fifty_c" numeric(7,2),
    "pour_point" numeric(7,2),
    "ash" numeric(7,2),
    "water_content" numeric(7,2),
    "sulphur_content" numeric(7,2),
    "vanadium" numeric(7,2),
    "sodium" numeric(7,2),
    "aluminium_silicon" numeric(7,2),
    "total_acid_number" numeric(7,2),
    "ccai" numeric(7,2),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "created_by" uuid not null,
    "updated_by" uuid not null
);

-- Create ports table
create table "public"."ports" (
  "id" uuid not null default gen_random_uuid(),
  "account_id" uuid not null,
  "ship_id" uuid not null,
  "port_name" text not null,
  "eta_date" timestamp with time zone,
  "created_at" timestamp with time zone not null default now(),
  "updated_at" timestamp with time zone not null default now(),
  "created_by" uuid not null,
  "updated_by" uuid not null
);

-- Create calculated ship price coefficient table
create table "public"."calculated_ship_price_coefficient" (
  "id" uuid not null default gen_random_uuid(),
  "account_id" uuid not null,
  "ship_id" uuid not null,
  "price_index" numeric(10,4),
  "price_and_quality_indicator" text,
  "final_decision" text,
  "best_price" numeric(10,2),
  "ship_inventory_index" numeric(10,4),
  "quality_index" numeric(10,4),
  "fuel_type" text,
  "port" text,
  "eta_date" date,
  "price_date" date,
  "created_at" timestamp with time zone not null default now(),
  "updated_at" timestamp with time zone not null default now(),
  "created_by" uuid not null,
  "updated_by" uuid not null
);

-- Create port fuel quality index table
create table "public"."port_fuel_quality_index" (
    "id" SERIAL PRIMARY KEY,
    "quality_parameter" VARCHAR(100) NOT NULL,
    "par_coefficient" NUMERIC(5,3) NOT NULL,
    "between_min_avg" NUMERIC(5,3) NOT NULL,
    "between_avg_max" NUMERIC(5,3) NOT NULL,
    "more_than_max" NUMERIC(5,3) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ships table
create table "public"."ships" (
    "id" uuid not null default gen_random_uuid(),
    "account_id" uuid not null,
  "name" text not null,
  "imo_number" text not null,
  "vessel_type" text,
  "capacity" numeric(10,2),
  "fuel_consumption_rate" numeric(8,2),
  "fuel_types" text not null default 'HFO,VLSFO,ULSFO',
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
  "created_by" uuid not null,
  "updated_by" uuid not null
);

-- Add comment to explain the fuel_types column
COMMENT ON COLUMN public.ships.fuel_types IS 'Comma-separated list of fuel types (HFO, VLSFO, ULSFO)';

-- Create a check constraint to ensure valid fuel types
ALTER TABLE public.ships 
ADD CONSTRAINT ships_fuel_types_check 
CHECK (
  fuel_types ~ '^(HFO|VLSFO|ULSFO)(,(HFO|VLSFO|ULSFO))*$'
);

-- Create price prediction files table
create table "public"."price_prediction_files" (
    "id" uuid not null default gen_random_uuid(),
    "account_id" uuid not null,
  "file_name" text not null,
  "storage_key" text not null,
  "file_size" bigint not null,
  "mime_type" text,
  "predictions" jsonb,
  "is_active" boolean not null default false,
  "processed_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
  "created_by" uuid not null,
  "updated_by" uuid not null
);

-- Create procurement decisions table
create table "public"."procurement_decisions" (
    "id" SERIAL PRIMARY KEY,
    "port_of_call" VARCHAR(100),
    "eta" VARCHAR(50),
    "fuel_type" VARCHAR(50),
    "price_index" VARCHAR(50),
    "quality_index" NUMERIC(5,2),
    "price_quality_indicator" VARCHAR(50),
    "ship_inventory_index" NUMERIC(5,2),
    "final_decision" VARCHAR(100),
    "best_price" NUMERIC(10,2),
    "price_date" DATE,
    "ship_id" INTEGER,
    "user_id" UUID,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create supply and demand data table
create table "public"."supply_and_demand_data" (
    "id" SERIAL PRIMARY KEY,
    "saudi_production_change" NUMERIC(10,4),
    "wti_production_change" NUMERIC(10,4),
    "spare_capacity" NUMERIC(10,4),
    "wti_gdp_deflated" NUMERIC(10,4),
    "capacity_percent_change" NUMERIC(10,4),
    "world_gdp_change" NUMERIC(10,4),
    "non_opec_production_change" NUMERIC(10,4),
    "opec_disruption" NUMERIC(10,4),
    "non_opec_disruption" NUMERIC(10,4),
    "nat_gas" NUMERIC(10,4),
    "gold" NUMERIC(10,4),
    "copper" NUMERIC(10,4),
    "silver" NUMERIC(10,4),
    "soy" NUMERIC(10,4),
    "corn" NUMERIC(10,4),
    "wheat" NUMERIC(10,4),
    "sp_500" NUMERIC(10,4),
    "dxy" NUMERIC(10,4),
    "treasury" NUMERIC(10,4),
    "treasury_tips_inflation_rate" NUMERIC(10,4),
    "crude_oil_implied_volatility" NUMERIC(10,4),
    "open_interest" NUMERIC(15,0),
    "money_managers_long" NUMERIC(15,0),
    "money_managers_short" NUMERIC(15,0),
    "money_managers_net" NUMERIC(15,0),
    "producers_merchants_long" NUMERIC(15,0),
    "producers_merchants_short" NUMERIC(15,0),
    "yoy_oedc_consumption_change" NUMERIC(10,4),
    "world_consumption_change" NUMERIC(10,4),
    "non_oecd_consumption_growth" NUMERIC(10,4),
    "inventory_change" NUMERIC(10,4),
    "spread_change" NUMERIC(10,4),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create supply and demand second data table
create table "public"."supply_and_demand_second_data" (
    "id" SERIAL PRIMARY KEY,
    "density_fifteen_c" NUMERIC(10,4),
    "k_viscosity_at_fifty" NUMERIC(10,4),
    "pour_point" NUMERIC(10,4),
    "ash" NUMERIC(10,4),
    "water_content" NUMERIC(10,4),
    "sulphur_content" NUMERIC(10,4),
    "vanadium" NUMERIC(10,4),
    "sodium" NUMERIC(10,4),
    "aluminium_silicon" NUMERIC(10,4),
    "total_acid_number" NUMERIC(10,4),
    "ccai" NUMERIC(10,4),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add primary keys
alter table "public"."customers" add constraint "customers_pkey" primary key ("id");
alter table "public"."fuel_inventory" add constraint "fuel_inventory_pkey" primary key ("id");
alter table "public"."fuel_quality_data" add constraint "fuel_quality_data_pkey" primary key ("id");
alter table "public"."ports" add constraint "ports_pkey" primary key ("id");
alter table "public"."calculated_ship_price_coefficient" add constraint "calculated_ship_price_coefficient_pkey" primary key ("id");

alter table "public"."ships" add constraint "ships_pkey" primary key ("id");
alter table "public"."price_prediction_files" add constraint "price_prediction_files_pkey" primary key ("id");



-- Add unique constraints
alter table "public"."ships" add constraint "ships_imo_number_key" unique ("imo_number");

-- Add foreign key constraints
alter table "public"."customers" add constraint "customers_account_id_fkey" foreign key ("account_id") references "public"."accounts" ("id") on delete cascade;
alter table "public"."fuel_inventory" add constraint "fuel_inventory_account_id_fkey" foreign key ("account_id") references "public"."accounts" ("id") on delete cascade;
alter table "public"."fuel_inventory" add constraint "fuel_inventory_ship_id_fkey" foreign key ("ship_id") references "public"."ships" ("id") on delete cascade;
alter table "public"."fuel_quality_data" add constraint "fuel_quality_data_account_id_fkey" foreign key ("account_id") references "public"."accounts" ("id") on delete cascade;
alter table "public"."ports" add constraint "ports_account_id_fkey" foreign key ("account_id") references "public"."accounts" ("id") on delete cascade;
alter table "public"."ports" add constraint "ports_ship_id_fkey" foreign key ("ship_id") references "public"."ships" ("id") on delete cascade;
alter table "public"."calculated_ship_price_coefficient" add constraint "calculated_ship_price_coefficient_account_id_fkey" foreign key ("account_id") references "public"."accounts" ("id") on delete cascade;
alter table "public"."calculated_ship_price_coefficient" add constraint "calculated_ship_price_coefficient_ship_id_fkey" foreign key ("ship_id") references "public"."ships" ("id") on delete cascade;

alter table "public"."ships" add constraint "ships_account_id_fkey" foreign key ("account_id") references "public"."accounts" ("id") on delete cascade;
alter table "public"."price_prediction_files" add constraint "price_prediction_files_account_id_fkey" foreign key ("account_id") references "public"."accounts" ("id") on delete cascade;



-- Add indexes for performance
create index "idx_customers_account_id" on "public"."customers" ("account_id");
create index "idx_fuel_inventory_account_id" on "public"."fuel_inventory" ("account_id");
create index "idx_fuel_quality_data_account_id" on "public"."fuel_quality_data" ("account_id");
create index "idx_ports_account_id" on "public"."ports" ("account_id");
create index "idx_calculated_ship_price_coefficient_account_id" on "public"."calculated_ship_price_coefficient" ("account_id");
create index "idx_calculated_ship_price_coefficient_ship_id" on "public"."calculated_ship_price_coefficient" ("ship_id");

create index "idx_ships_account_id" on "public"."ships" ("account_id");
create index "idx_price_prediction_files_account_id" on "public"."price_prediction_files" ("account_id");
create index "idx_price_prediction_files_active" on "public"."price_prediction_files" ("is_active") where ("is_active" = true);



-- Enable RLS on all tables
alter table "public"."customers" enable row level security;
alter table "public"."fuel_inventory" enable row level security;
alter table "public"."fuel_quality_data" enable row level security;
alter table "public"."ports" enable row level security;
alter table "public"."calculated_ship_price_coefficient" enable row level security;
alter table "public"."port_fuel_quality_index" enable row level security;
alter table "public"."ships" enable row level security;
alter table "public"."price_prediction_files" enable row level security;
alter table "public"."procurement_decisions" enable row level security;
alter table "public"."supply_and_demand_data" enable row level security;
alter table "public"."supply_and_demand_second_data" enable row level security;

-- Create RLS policies for customers
create policy "customers_select" on "public"."customers" for select using (
  public.has_role_on_account(account_id)
);
create policy "customers_insert" on "public"."customers" for insert with check (
  public.has_role_on_account(account_id)
);
create policy "customers_update" on "public"."customers" for update using (
  public.has_role_on_account(account_id)
);
create policy "customers_delete" on "public"."customers" for delete using (
  public.has_role_on_account(account_id)
);

-- Create RLS policies for fuel_inventory
create policy "fuel_inventory_select" on "public"."fuel_inventory" for select using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "fuel_inventory_insert" on "public"."fuel_inventory" for insert with check (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "fuel_inventory_update" on "public"."fuel_inventory" for update using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "fuel_inventory_delete" on "public"."fuel_inventory" for delete using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);

-- Create RLS policies for fuel_quality_data
create policy "fuel_quality_data_select" on "public"."fuel_quality_data" for select using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "fuel_quality_data_insert" on "public"."fuel_quality_data" for insert with check (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "fuel_quality_data_update" on "public"."fuel_quality_data" for update using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "fuel_quality_data_delete" on "public"."fuel_quality_data" for delete using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);

-- Create RLS policies for ports
create policy "ports_select" on "public"."ports" for select using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "ports_insert" on "public"."ports" for insert with check (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "ports_update" on "public"."ports" for update using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "ports_delete" on "public"."ports" for delete using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);

-- Create RLS policies for calculated_ship_price_coefficient
create policy "calculated_ship_price_coefficient_select" on "public"."calculated_ship_price_coefficient" for select using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "calculated_ship_price_coefficient_insert" on "public"."calculated_ship_price_coefficient" for insert with check (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "calculated_ship_price_coefficient_update" on "public"."calculated_ship_price_coefficient" for update using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "calculated_ship_price_coefficient_delete" on "public"."calculated_ship_price_coefficient" for delete using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);

-- Create RLS policies for port_fuel_quality_index (allow all authenticated users to read, but only admins to modify)
create policy "port_fuel_quality_index_select" on "public"."port_fuel_quality_index" for select using (
  auth.role() = 'authenticated'
);
create policy "port_fuel_quality_index_insert" on "public"."port_fuel_quality_index" for insert with check (
  auth.role() = 'authenticated'
);
create policy "port_fuel_quality_index_update" on "public"."port_fuel_quality_index" for update using (
  auth.role() = 'authenticated'
);
create policy "port_fuel_quality_index_delete" on "public"."port_fuel_quality_index" for delete using (
  auth.role() = 'authenticated'
);

-- Create RLS policies for ships
create policy "ships_select" on "public"."ships" for select using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "ships_insert" on "public"."ships" for insert with check (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "ships_update" on "public"."ships" for update using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "ships_delete" on "public"."ships" for delete using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);

-- Create RLS policies for price_prediction_files
create policy "price_prediction_files_select" on "public"."price_prediction_files" for select using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "price_prediction_files_insert" on "public"."price_prediction_files" for insert with check (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "price_prediction_files_update" on "public"."price_prediction_files" for update using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);
create policy "price_prediction_files_delete" on "public"."price_prediction_files" for delete using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);

-- Create RLS policies for procurement_decisions (allow all authenticated users to read, but only admins to modify)
create policy "procurement_decisions_select" on "public"."procurement_decisions" for select using (
  auth.role() = 'authenticated'
);
create policy "procurement_decisions_insert" on "public"."procurement_decisions" for insert with check (
  auth.role() = 'authenticated'
);
create policy "procurement_decisions_update" on "public"."procurement_decisions" for update using (
  auth.role() = 'authenticated'
);
create policy "procurement_decisions_delete" on "public"."procurement_decisions" for delete using (
  auth.role() = 'authenticated'
);

-- Create RLS policies for supply_and_demand_data (allow all authenticated users to read, but only admins to modify)
create policy "supply_and_demand_data_select" on "public"."supply_and_demand_data" for select using (
  auth.role() = 'authenticated'
);
create policy "supply_and_demand_data_insert" on "public"."supply_and_demand_data" for insert with check (
  auth.role() = 'authenticated'
);
create policy "supply_and_demand_data_update" on "public"."supply_and_demand_data" for update using (
  auth.role() = 'authenticated'
);
create policy "supply_and_demand_data_delete" on "public"."supply_and_demand_data" for delete using (
  auth.role() = 'authenticated'
);

-- Create RLS policies for supply_and_demand_second_data (allow all authenticated users to read, but only admins to modify)
create policy "supply_and_demand_second_data_select" on "public"."supply_and_demand_second_data" for select using (
  auth.role() = 'authenticated'
);
create policy "supply_and_demand_second_data_insert" on "public"."supply_and_demand_second_data" for insert with check (
  auth.role() = 'authenticated'
);
create policy "supply_and_demand_second_data_update" on "public"."supply_and_demand_second_data" for update using (
  auth.role() = 'authenticated'
);
create policy "supply_and_demand_second_data_delete" on "public"."supply_and_demand_second_data" for delete using (
  auth.role() = 'authenticated'
);

-- Add triggers for timestamps and user tracking
create trigger "trigger_customers_timestamps"
  before insert or update on "public"."customers"
  for each row execute function "public"."trigger_set_timestamps"();

create trigger "trigger_customers_user_tracking"
  before insert or update on "public"."customers"
  for each row execute function "public"."trigger_set_user_tracking"();

create trigger "trigger_fuel_inventory_timestamps"
  before insert or update on "public"."fuel_inventory"
  for each row execute function "public"."trigger_set_timestamps"();

create trigger "trigger_fuel_inventory_user_tracking"
  before insert or update on "public"."fuel_inventory"
  for each row execute function "public"."trigger_set_user_tracking"();

create trigger "trigger_fuel_quality_data_timestamps"
  before insert or update on "public"."fuel_quality_data"
  for each row execute function "public"."trigger_set_timestamps"();

create trigger "trigger_fuel_quality_data_user_tracking"
  before insert or update on "public"."fuel_quality_data"
  for each row execute function "public"."trigger_set_user_tracking"();

create trigger "trigger_ports_timestamps"
  before insert or update on "public"."ports"
  for each row execute function "public"."trigger_set_timestamps"();

create trigger "trigger_ports_user_tracking"
  before insert or update on "public"."ports"
  for each row execute function "public"."trigger_set_user_tracking"();

create trigger "trigger_calculated_ship_price_coefficient_timestamps"
  before insert or update on "public"."calculated_ship_price_coefficient"
  for each row execute function "public"."trigger_set_timestamps"();

create trigger "trigger_calculated_ship_price_coefficient_user_tracking"
  before insert or update on "public"."calculated_ship_price_coefficient"
  for each row execute function "public"."trigger_set_user_tracking"();

create trigger "trigger_port_fuel_quality_index_timestamps"
  before insert or update on "public"."port_fuel_quality_index"
  for each row execute function "public"."trigger_set_timestamps"();

create trigger "trigger_ships_timestamps"
  before insert or update on "public"."ships"
  for each row execute function "public"."trigger_set_timestamps"();

create trigger "trigger_ships_user_tracking"
  before insert or update on "public"."ships"
  for each row execute function "public"."trigger_set_user_tracking"();

create trigger "trigger_price_prediction_files_timestamps"
  before insert or update on "public"."price_prediction_files"
  for each row execute function "public"."trigger_set_timestamps"();

create trigger "trigger_price_prediction_files_user_tracking"
  before insert or update on "public"."price_prediction_files"
  for each row execute function "public"."trigger_set_user_tracking"();

create trigger "trigger_procurement_decisions_timestamps"
  before insert or update on "public"."procurement_decisions"
  for each row execute function "public"."trigger_set_timestamps"();

create trigger "trigger_supply_and_demand_data_timestamps"
  before insert or update on "public"."supply_and_demand_data"
  for each row execute function "public"."trigger_set_timestamps"();

create trigger "trigger_supply_and_demand_second_data_timestamps"
  before insert or update on "public"."supply_and_demand_second_data"
  for each row execute function "public"."trigger_set_timestamps"();

-- Create storage bucket for fuel manager files
insert into storage.buckets (id, name, public)
values ('fuel-manager-files', 'fuel-manager-files', false);

-- Create RLS policies for storage bucket fuel-manager-files
create policy "fuel-manager-files-select" on storage.objects for select using (
  bucket_id = 'fuel-manager-files'
  and auth.role() = 'authenticated'
);

create policy "fuel-manager-files-insert" on storage.objects for insert with check (
  bucket_id = 'fuel-manager-files'
  and auth.role() = 'authenticated'
);

create policy "fuel-manager-files-update" on storage.objects for update using (
  bucket_id = 'fuel-manager-files'
  and auth.role() = 'authenticated'
);

create policy "fuel-manager-files-delete" on storage.objects for delete using (
  bucket_id = 'fuel-manager-files'
  and auth.role() = 'authenticated'
);

-- Create fuel quality file metadata table
create table "public"."fuel_quality_files" (
    "id" uuid not null default gen_random_uuid(),
    "account_id" uuid not null,
    "file_name" text not null,
    "storage_key" text not null,
    "file_size" bigint not null,
    "mime_type" text,
    "fuel_type" public.fuel_type,
    "is_processed" boolean not null default false,
    "processing_status" text default 'pending',
    "error_message" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "created_by" uuid not null,
    "updated_by" uuid not null
);

-- Create RLS policies for fuel_quality_files
create policy "fuel_quality_files_select" on "public"."fuel_quality_files" for select using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);

create policy "fuel_quality_files_insert" on "public"."fuel_quality_files" for insert with check (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);

create policy "fuel_quality_files_update" on "public"."fuel_quality_files" for update using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);

create policy "fuel_quality_files_delete" on "public"."fuel_quality_files" for delete using (
  account_id = auth.uid() OR public.has_role_on_account(account_id)
);

-- Add triggers for fuel_quality_files
create trigger "trigger_fuel_quality_files_timestamps"
  before insert or update on "public"."fuel_quality_files"
  for each row execute function "public"."trigger_set_timestamps"();

create trigger "trigger_fuel_quality_files_user_tracking"
  before insert or update on "public"."fuel_quality_files"
  for each row execute function "public"."trigger_set_user_tracking"();

-- Create fuel_types table
create table if not exists public.fuel_types (
  id SERIAL PRIMARY KEY,
  fuel_type_name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on fuel_types table
alter table "public"."fuel_types" enable row level security;

-- Create RLS policies for fuel_types (allow all authenticated users to read, but only admins to modify)
create policy "fuel_types_select" on "public"."fuel_types" for select using (
  auth.role() = 'authenticated'
);

create policy "fuel_types_insert" on "public"."fuel_types" for insert with check (
  auth.role() = 'authenticated'
);

create policy "fuel_types_update" on "public"."fuel_types" for update using (
  auth.role() = 'authenticated'
);

create policy "fuel_types_delete" on "public"."fuel_types" for delete using (
  auth.role() = 'authenticated'
);

-- Add triggers for fuel_types
create trigger "trigger_fuel_types_timestamps"
  before insert or update on "public"."fuel_types"
  for each row execute function "public"."trigger_set_timestamps"();

-- Insert some default fuel types
insert into public.fuel_types (fuel_type_name) values
  ('Diesel'),
  ('Gasoline'),
  ('Heavy Fuel Oil'),
  ('Marine Gas Oil'),
  ('Liquefied Natural Gas')
on conflict (fuel_type_name) do nothing;

-- Insert some default port fuel quality index data
insert into public.port_fuel_quality_index (quality_parameter, par_coefficient, between_min_avg, between_avg_max, more_than_max) values
  ('Density', 0.850, 0.840, 0.860, 0.870),
  ('Viscosity', 2.500, 2.000, 3.000, 3.500),
  ('Sulphur Content', 0.100, 0.050, 0.150, 0.200),
  ('Water Content', 0.050, 0.030, 0.070, 0.100),
  ('Ash Content', 0.010, 0.005, 0.015, 0.020)
on conflict do nothing;

-- Create port fuel quality value table
create table "public"."port_fuel_quality_value" (
    "id" SERIAL PRIMARY KEY,
    "quality_parameter" VARCHAR(100) NOT NULL,
    "par_coefficient" NUMERIC(5,3) NOT NULL,
    "between_min_avg" NUMERIC(5,3) NOT NULL,
    "between_avg_max" NUMERIC(5,3) NOT NULL,
    "more_than_max" NUMERIC(5,3) NOT NULL,
    "fuel_type" VARCHAR(50),
    "grade" VARCHAR(50),
    "date" DATE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
alter table "public"."port_fuel_quality_value" enable row level security;

-- Create RLS policies for port_fuel_quality_value (allow all authenticated users to read, but only admins to modify)
create policy "port_fuel_quality_value_select" on "public"."port_fuel_quality_value" for select using (
  auth.role() = 'authenticated'
);
create policy "port_fuel_quality_value_insert" on "public"."port_fuel_quality_value" for insert with check (
  auth.role() = 'authenticated'
);
create policy "port_fuel_quality_value_update" on "public"."port_fuel_quality_value" for update using (
  auth.role() = 'authenticated'
);
create policy "port_fuel_quality_value_delete" on "public"."port_fuel_quality_value" for delete using (
  auth.role() = 'authenticated'
);

-- Create trigger for timestamps
create trigger "trigger_port_fuel_quality_value_timestamps"
  before insert or update on "public"."port_fuel_quality_value"
  for each row execute function "public"."trigger_set_timestamps"();

-- Insert some default port fuel quality value data
insert into public.port_fuel_quality_value (quality_parameter, par_coefficient, between_min_avg, between_avg_max, more_than_max, fuel_type, grade, date) values
  ('Density', 0.850, 0.840, 0.860, 0.870, 'Diesel', 'Premium', '2025-01-01'),
  ('Viscosity', 2.500, 2.000, 3.000, 3.500, 'Diesel', 'Standard', '2025-01-01'),
  ('Sulphur Content', 0.100, 0.050, 0.150, 0.200, 'Heavy Fuel Oil', 'Low Sulphur', '2025-01-01'),
  ('Water Content', 0.050, 0.030, 0.070, 0.100, 'Marine Gas Oil', 'Premium', '2025-01-01'),
  ('Ash Content', 0.010, 0.005, 0.015, 0.020, 'Liquefied Natural Gas', 'Standard', '2025-01-01')
on conflict do nothing;

-- Insert some default procurement decisions data
insert into public.procurement_decisions (port_of_call, eta, fuel_type, price_index, quality_index, price_quality_indicator, ship_inventory_index, final_decision, best_price, price_date) values
  ('Rotterdam', '2025-01-15', 'Diesel', 'Brent', 85.5, 'Good', 75.2, 'Purchase', 850.50, '2025-01-01'),
  ('Singapore', '2025-01-20', 'Heavy Fuel Oil', 'WTI', 72.3, 'Fair', 68.1, 'Hold', 720.30, '2025-01-01'),
  ('Shanghai', '2025-01-25', 'Marine Gas Oil', 'Brent', 88.7, 'Excellent', 82.4, 'Purchase', 887.00, '2025-01-01'),
  ('Los Angeles', '2025-01-30', 'Liquefied Natural Gas', 'Henry Hub', 91.2, 'Excellent', 89.6, 'Purchase', 912.00, '2025-01-01'),
  ('Dubai', '2025-02-05', 'Diesel', 'Dubai', 78.9, 'Good', 71.3, 'Hold', 789.00, '2025-01-01')
on conflict do nothing;

-- Insert some default supply and demand data
insert into public.supply_and_demand_data (saudi_production_change, wti_production_change, spare_capacity, wti_gdp_deflated, capacity_percent_change, world_gdp_change, non_opec_production_change, opec_disruption, non_opec_disruption, nat_gas, gold, copper, silver, soy, corn, wheat, sp_500, dxy, treasury, treasury_tips_inflation_rate, crude_oil_implied_volatility, open_interest, money_managers_long, money_managers_short, money_managers_net, producers_merchants_long, producers_merchants_short, yoy_oedc_consumption_change, world_consumption_change, non_oecd_consumption_growth, inventory_change, spread_change) values
  (0.5, 1.2, 2.1, 75.50, 0.8, 2.5, 0.9, 0.3, 0.2, 3.25, 1950.00, 4.50, 25.75, 12.80, 4.20, 5.80, 4500.00, 105.50, 4.25, 2.10, 25.50, 2500000, 350000, 120000, 230000, 180000, 200000, 1.2, 1.8, 2.5, -0.5, 0.3),
  (0.3, 0.8, 1.8, 74.20, 0.6, 2.2, 0.7, 0.2, 0.1, 3.10, 1920.00, 4.35, 25.50, 12.60, 4.15, 5.75, 4480.00, 105.20, 4.20, 2.05, 24.80, 2480000, 345000, 118000, 227000, 178000, 198000, 1.1, 1.7, 2.4, -0.4, 0.25),
  (0.7, 1.5, 2.3, 76.80, 1.0, 2.8, 1.1, 0.4, 0.3, 3.40, 1980.00, 4.65, 26.00, 13.00, 4.25, 5.85, 4520.00, 105.80, 4.30, 2.15, 26.20, 2520000, 355000, 122000, 233000, 182000, 202000, 1.3, 1.9, 2.6, -0.6, 0.35)
on conflict do nothing;

-- Insert some default supply and demand second data
insert into public.supply_and_demand_second_data (density_fifteen_c, k_viscosity_at_fifty, pour_point, ash, water_content, sulphur_content, vanadium, sodium, aluminium_silicon, total_acid_number, ccai) values
  (0.9850, 180.5, -12.0, 0.05, 0.15, 2.8, 150.0, 25.0, 15.0, 2.5, 850.0),
  (0.9870, 185.2, -15.0, 0.06, 0.12, 3.1, 165.0, 30.0, 18.0, 2.8, 870.0),
  (0.9830, 175.8, -10.0, 0.04, 0.18, 2.5, 140.0, 20.0, 12.0, 2.2, 830.0)
on conflict do nothing;
