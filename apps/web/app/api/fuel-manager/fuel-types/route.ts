import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/fuel-types - Get all fuel types
export async function GET(request: NextRequest) {
  try {
    console.log('=== Fuel Types GET API Debug ===');
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

    // Get all fuel types
    const { data: fuelTypes, error } = await supabase
      .from('fuel_types')
      .select('*')
      .order('fuel_type_name', { ascending: true });

    if (error) {
      console.error('Error fetching fuel types:', error);
      return NextResponse.json({ error: 'Failed to fetch fuel types' }, { status: 500 });
    }

    return NextResponse.json(fuelTypes || []);
  } catch (error) {
    console.error('Error in GET /api/fuel-manager/fuel-types:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/fuel-manager/fuel-types - Create new fuel type
export async function POST(request: NextRequest) {
  try {
    console.log('=== Fuel Types POST API Debug ===');
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
    const { fuelTypeName } = body;

    if (!fuelTypeName) {
      return NextResponse.json({ error: 'Fuel type name is required' }, { status: 400 });
    }

    // Create new fuel type
    const { data: newFuelType, error } = await supabase
      .from('fuel_types')
      .insert({ fuel_type_name: fuelTypeName })
      .select()
      .single();

    if (error) {
      console.error('Error creating fuel type:', error);
      return NextResponse.json({ 
        error: 'Failed to create fuel type',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Fuel type created successfully',
      fuelType: newFuelType
    });
  } catch (error) {
    console.error('Error in POST /api/fuel-manager/fuel-types:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create fuel type' },
      { status: 500 }
    );
  }
}
