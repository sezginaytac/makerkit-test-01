import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/ships/[id] - Get ship by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Ship GET by ID API Debug ===');
    console.log('Ship ID:', params.id);
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

    // Get ship by ID
    const { data: ship, error } = await supabase
      .from('ships')
      .select('*')
      .eq('id', params.id)
      .eq('account_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching ship:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Ship not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch ship' }, { status: 500 });
    }

    return NextResponse.json(ship);
  } catch (error) {
    console.error('Error in GET /api/fuel-manager/ships/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/fuel-manager/ships/[id] - Update a ship
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Ships PUT API Debug ===');
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

    // Check if ship exists and belongs to the user's team
    const targetAccountId = accountId || user.id;
    const { data: existingShip, error: fetchError } = await supabase
      .from('ships')
      .select('*')
      .eq('id', params.id)
      .eq('account_id', targetAccountId)
      .single();

    if (fetchError || !existingShip) {
      return NextResponse.json(
        { error: 'Ship not found' },
        { status: 404 }
      );
    }

    // Check if the new name conflicts with another ship (excluding current ship)
    const { data: conflictingShip } = await supabase
      .from('ships')
      .select('id')
      .eq('name', shipName)
      .eq('account_id', targetAccountId)
      .neq('id', params.id)
      .single();

    if (conflictingShip) {
      return NextResponse.json(
        { error: 'A ship with this name already exists' },
        { status: 400 }
      );
    }

    // Update ship data
    const updateData: any = { 
      name: shipName,
      updated_by: user.id
    };

    // Add IMO number if provided
    if (shipImoNumber) {
      updateData.imo_number = shipImoNumber;
    }

    // Add optional fields
    if (shipVesselType !== undefined) {
      updateData.vessel_type = shipVesselType;
    }
    if (capacity !== undefined) {
      updateData.capacity = capacity;
    }
    if (shipFuelConsumptionRate !== undefined) {
      updateData.fuel_consumption_rate = shipFuelConsumptionRate;
    }
    if (fuel_types !== undefined) {
      updateData.fuel_types = fuel_types;
    }

    const { data: ship, error } = await supabase
      .from('ships')
      .update(updateData)
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating ship:', error);
      return NextResponse.json({ 
        error: 'Failed to update ship',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Ship updated successfully',
      ship 
    });
  } catch (error) {
    console.error('Error in PUT /api/fuel-manager/ships/[id]:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update ship',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE /api/fuel-manager/ships/[id] - Delete a ship
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Ships DELETE API Debug ===');
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

    // Check if ship exists and belongs to the user's team
    // For DELETE, we'll use RLS policies to handle access control
    const { data: existingShip, error: fetchError } = await supabase
      .from('ships')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingShip) {
      return NextResponse.json(
        { error: 'Ship not found' },
        { status: 404 }
      );
    }

    // Delete the ship
    const { error } = await supabase
      .from('ships')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting ship:', error);
      return NextResponse.json({ 
        error: 'Failed to delete ship',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Ship deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/fuel-manager/ships/[id]:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete ship',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
