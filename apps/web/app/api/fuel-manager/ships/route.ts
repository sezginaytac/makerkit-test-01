import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/ships - Get all ships
export async function GET(request: NextRequest) {
  try {
    console.log('=== Ships GET API Debug ===');
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

    // Get all ships - RLS policies will handle access control
    const { data: ships, error } = await supabase
      .from('ships')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching ships:', error);
      return NextResponse.json({ error: 'Failed to fetch ships' }, { status: 500 });
    }

    return NextResponse.json(ships || []);
  } catch (error) {
    console.error('Error in GET /api/fuel-manager/ships:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/fuel-manager/ships - Create a new ship
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, imoNumber, imo_number, vesselType, vessel_type, capacity, fuelConsumptionRate, fuel_consumption_rate, fuel_types, accountId } = body;

    // Handle both camelCase and snake_case field names
    const shipName = name;
    const shipImoNumber = imoNumber || imo_number;
    const shipVesselType = vesselType || vessel_type;
    const shipFuelConsumptionRate = fuelConsumptionRate || fuel_consumption_rate;

    if (!shipName || !shipImoNumber) {
      return NextResponse.json(
        { error: 'Name and IMO number are required' },
        { status: 400 }
      );
    }

                 // Validate fuel_types if provided
             if (fuel_types && typeof fuel_types === 'string') {
               const validFuelTypes = ['HFO', 'VLSFO', 'ULSFO'];
               const providedFuelTypes = fuel_types.split(',').map(t => t.trim());
               const invalidFuelTypes = providedFuelTypes.filter(t => !validFuelTypes.includes(t));
               
               if (invalidFuelTypes.length > 0) {
                 return NextResponse.json(
                   { error: `Invalid fuel types: ${invalidFuelTypes.join(', ')}. Valid types are: ${validFuelTypes.join(', ')}` },
                   { status: 400 }
                 );
               }
             }

    // Check if ship already exists
    const { data: existingShip } = await supabase
      .from('ships')
      .select('id')
      .eq('name', shipName)
      .eq('account_id', accountId || user.id)
      .single();

    if (existingShip) {
      return NextResponse.json(
        { error: 'Ship already exists' },
        { status: 400 }
      );
    }

    // Create new ship
    const shipData: any = { 
      name: shipName,
      account_id: accountId || user.id, // Use provided accountId or fallback to user.id
      fuel_types: fuel_types || 'HFO,VLSFO,ULSFO', // Default to all fuel types if not provided
      created_by: user.id,
      updated_by: user.id
    };

    // Add IMO number if provided
    if (shipImoNumber) {
      shipData.imo_number = shipImoNumber;
    } else {
      // Generate a default IMO number if not provided
      shipData.imo_number = `IMO${Date.now()}`;
    }

    // Add optional fields
    if (shipVesselType) {
      shipData.vessel_type = shipVesselType;
    }
    if (capacity) {
      shipData.capacity = capacity;
    }
    if (shipFuelConsumptionRate) {
      shipData.fuel_consumption_rate = shipFuelConsumptionRate;
    }

    const { data: ship, error } = await supabase
      .from('ships')
      .insert(shipData)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating ship:', error);
      return NextResponse.json({ 
        error: 'Failed to create ship',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Ship created successfully',
      ship 
    });
  } catch (error) {
    console.error('Error in POST /api/fuel-manager/ships:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create ship',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
