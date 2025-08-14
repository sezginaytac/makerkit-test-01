import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/supply-and-demand-second-data/[id] - Get supply and demand second data by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Supply and Demand Second Data GET by ID API Debug ===');
    console.log('Supply and demand second data ID:', params.id);
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

    // Get supply and demand second data by ID
    const { data: supplyAndDemandSecondData, error } = await supabase
      .from('supply_and_demand_second_data')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching supply and demand second data:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Supply and demand second data not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch supply and demand second data' }, { status: 500 });
    }

    return NextResponse.json(supplyAndDemandSecondData);
  } catch (error) {
    console.error('Error in GET /api/fuel-manager/supply-and-demand-second-data/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/fuel-manager/supply-and-demand-second-data/[id] - Update supply and demand second data
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Supply and Demand Second Data PUT API Debug ===');
    console.log('Supply and demand second data ID:', params.id);
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
      densityFifteenC, kViscosityAtFifty, pourPoint, ash, waterContent,
      sulphurContent, vanadium, sodium, aluminiumSilicon, totalAcidNumber, ccai
    } = body;

    // Update supply and demand second data
    const { data: updatedSupplyAndDemandSecondData, error } = await supabase
      .from('supply_and_demand_second_data')
      .update({
        density_fifteen_c: densityFifteenC,
        k_viscosity_at_fifty: kViscosityAtFifty,
        pour_point: pourPoint,
        ash: ash,
        water_content: waterContent,
        sulphur_content: sulphurContent,
        vanadium: vanadium,
        sodium: sodium,
        aluminium_silicon: aluminiumSilicon,
        total_acid_number: totalAcidNumber,
        ccai: ccai
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating supply and demand second data:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Supply and demand second data not found' }, { status: 404 });
      }
      return NextResponse.json({ 
        error: 'Failed to update supply and demand second data',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Supply and demand second data updated successfully',
      supplyAndDemandSecondData: updatedSupplyAndDemandSecondData
    });
  } catch (error) {
    console.error('Error in PUT /api/fuel-manager/supply-and-demand-second-data/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update supply and demand second data' },
      { status: 500 }
    );
  }
}

// DELETE /api/fuel-manager/supply-and-demand-second-data/[id] - Delete supply and demand second data
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Supply and Demand Second Data DELETE API Debug ===');
    console.log('Supply and demand second data ID:', params.id);
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

    // Delete supply and demand second data
    const { error } = await supabase
      .from('supply_and_demand_second_data')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting supply and demand second data:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Supply and demand second data not found' }, { status: 404 });
      }
      return NextResponse.json({ 
        error: 'Failed to delete supply and demand second data',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Supply and demand second data deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/fuel-manager/supply-and-demand-second-data/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete supply and demand second data' },
      { status: 500 }
    );
  }
}
