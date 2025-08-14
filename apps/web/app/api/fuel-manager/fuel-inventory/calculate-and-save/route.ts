import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Calculate and Save Fuel Inventory API Debug ===');
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
    const { shipName, fuelType, rob, me, ae, boiler, maxFuelCapacity, minFuelPolicy, averageVoyagePeriod } = body;

    if (!shipName || !fuelType) {
      return NextResponse.json(
        { error: 'Required fields: shipName, fuelType' },
        { status: 400 }
      );
    }

    // Debug: Check if ship exists using RLS-aware client
    console.log('=== Debug: Checking ship existence ===');
    console.log('User ID:', user.id);
    console.log('Ship Name:', shipName);
    
    // Check if ship exists using RLS-aware client
    const { data: existingShip, error: shipError } = await supabase
      .from('ships')
      .select('*')
      .eq('name', shipName)
      .eq('account_id', user.id)
      .single();
    
    console.log('Ship query error:', shipError);
    console.log('Existing ship:', existingShip);
    
    if (!existingShip) {
      return NextResponse.json(
        { error: `Ship not found for name: ${shipName}. Please create the ship first.` },
        { status: 404 }
      );
    }
    

    
    // Create fuel inventory record
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('fuel_inventory')
      .insert({
        ship_id: existingShip.id,
        fuel_type: fuelType,
        rob: rob || null,
        me: me || null,
        ae: ae || null,
        boiler: boiler || null,
        max_fuel_capacity: maxFuelCapacity || null,
        min_fuel_policy: minFuelPolicy || null,
        average_voyage_period: averageVoyagePeriod || null,
        account_id: user.id,
        created_by: user.id,
        updated_by: user.id
      })
      .select(`
        *,
        ships(name)
      `)
      .single();
    
    if (inventoryError) {
      console.error('Error creating fuel inventory:', inventoryError);
      return NextResponse.json({ error: 'Failed to create fuel inventory' }, { status: 500 });
    }

    return NextResponse.json(inventoryData);
  } catch (error) {
    console.error('Error in calculate and save fuel inventory:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate and save fuel inventory' },
      { status: 500 }
    );
  }
}
