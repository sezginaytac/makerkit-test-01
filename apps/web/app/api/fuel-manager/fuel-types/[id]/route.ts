import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/fuel-types/[id] - Get fuel type by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Fuel Type GET by ID API Debug ===');
    console.log('Fuel type ID:', params.id);
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

    // Get fuel type by ID
    const { data: fuelType, error } = await supabase
      .from('fuel_types')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching fuel type:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Fuel type not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch fuel type' }, { status: 500 });
    }

    return NextResponse.json(fuelType);
  } catch (error) {
    console.error('Error in GET /api/fuel-manager/fuel-types/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/fuel-manager/fuel-types/[id] - Update fuel type
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Fuel Type PUT API Debug ===');
    console.log('Fuel type ID:', params.id);
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

    // Update fuel type
    const { data: updatedFuelType, error } = await supabase
      .from('fuel_types')
      .update({ fuel_type_name: fuelTypeName })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating fuel type:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Fuel type not found' }, { status: 404 });
      }
      return NextResponse.json({ 
        error: 'Failed to update fuel type',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Fuel type updated successfully',
      fuelType: updatedFuelType
    });
  } catch (error) {
    console.error('Error in PUT /api/fuel-manager/fuel-types/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update fuel type' },
      { status: 500 }
    );
  }
}

// DELETE /api/fuel-manager/fuel-types/[id] - Delete fuel type
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Fuel Type DELETE API Debug ===');
    console.log('Fuel type ID:', params.id);
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

    // Delete fuel type
    const { error } = await supabase
      .from('fuel_types')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting fuel type:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Fuel type not found' }, { status: 404 });
      }
      return NextResponse.json({ 
        error: 'Failed to delete fuel type',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Fuel type deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/fuel-manager/fuel-types/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete fuel type' },
      { status: 500 }
    );
  }
}
