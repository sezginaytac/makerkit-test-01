import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/supply-and-demand-data - Get all supply and demand data
export async function GET(request: NextRequest) {
  try {
    console.log('=== Supply and Demand Data GET API Debug ===');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Request cookies:', request.cookies.getAll());
    
    // Try to get JWT token from Authorization header first
    const authHeader = request.headers.get('authorization');
    let supabase;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log('Using Authorization header for authentication');
      const token = authHeader.substring(7);
      
      // Create client with JWT token
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );
    } else {
      console.log('Using cookie-based authentication');
      supabase = getSupabaseServerClient();
    }
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth result - user:', user ? 'exists' : 'null');
    console.log('Auth result - error:', authError);
    
    if (authError || !user) {
      console.log('Authentication failed - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all supply and demand data
    const { data: supplyAndDemandData, error } = await supabase
      .from('supply_and_demand_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching supply and demand data:', error);
      return NextResponse.json({ error: 'Failed to fetch supply and demand data' }, { status: 500 });
    }

    return NextResponse.json(supplyAndDemandData || []);
  } catch (error) {
    console.error('Error in GET /api/fuel-manager/supply-and-demand-data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/fuel-manager/supply-and-demand-data - Create new supply and demand data
export async function POST(request: NextRequest) {
  try {
    console.log('=== Supply and Demand Data POST API Debug ===');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Request cookies:', request.cookies.getAll());
    
    // Try to get JWT token from Authorization header first
    const authHeader = request.headers.get('authorization');
    let supabase;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log('Using Authorization header for authentication');
      const token = authHeader.substring(7);
      
      // Create client with JWT token
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );
    } else {
      console.log('Using cookie-based authentication');
      supabase = getSupabaseServerClient();
    }
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth result - user:', user ? 'exists' : 'null');
    console.log('Auth result - error:', authError);
    
    if (authError || !user) {
      console.log('Authentication failed - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      saudiProductionChange, wtiProductionChange, spareCapacity, wtiGDPDeflated,
      capacityPercentChange, worldGDPChange, nonOPECProductionChange, opecDisruption,
      nonOPECDisruption, natGas, gold, copper, silver, soy, corn, wheat,
      sp500, dxy, treasury, treasuryTIPSInflationRate, crudeOilImpliedVolatility,
      openInterest, moneyManagersLong, moneyManagersShort, moneyManagersNet,
      producersMerchantsLong, producersMerchantsShort, yoyOEDCConsumptionChange,
      worldConsumptionChange, nonOECDConsumptionGrowth, inventoryChange, spreadChange
    } = body;

    // Create new supply and demand data
    const { data: newSupplyAndDemandData, error } = await supabase
      .from('supply_and_demand_data')
      .insert({
        saudi_production_change: saudiProductionChange,
        wti_production_change: wtiProductionChange,
        spare_capacity: spareCapacity,
        wti_gdp_deflated: wtiGDPDeflated,
        capacity_percent_change: capacityPercentChange,
        world_gdp_change: worldGDPChange,
        non_opec_production_change: nonOPECProductionChange,
        opec_disruption: opecDisruption,
        non_opec_disruption: nonOPECDisruption,
        nat_gas: natGas,
        gold: gold,
        copper: copper,
        silver: silver,
        soy: soy,
        corn: corn,
        wheat: wheat,
        sp_500: sp500,
        dxy: dxy,
        treasury: treasury,
        treasury_tips_inflation_rate: treasuryTIPSInflationRate,
        crude_oil_implied_volatility: crudeOilImpliedVolatility,
        open_interest: openInterest,
        money_managers_long: moneyManagersLong,
        money_managers_short: moneyManagersShort,
        money_managers_net: moneyManagersNet,
        producers_merchants_long: producersMerchantsLong,
        producers_merchants_short: producersMerchantsShort,
        yoy_oedc_consumption_change: yoyOEDCConsumptionChange,
        world_consumption_change: worldConsumptionChange,
        non_oecd_consumption_growth: nonOECDConsumptionGrowth,
        inventory_change: inventoryChange,
        spread_change: spreadChange
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating supply and demand data:', error);
      return NextResponse.json({ 
        error: 'Failed to create supply and demand data',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Supply and demand data created successfully',
      supplyAndDemandData: newSupplyAndDemandData
    });
  } catch (error) {
    console.error('Error in POST /api/fuel-manager/supply-and-demand-data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create supply and demand data' },
      { status: 500 }
    );
  }
}
