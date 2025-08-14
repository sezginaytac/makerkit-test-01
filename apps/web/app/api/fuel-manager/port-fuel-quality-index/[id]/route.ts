import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/port-fuel-quality-index/[id] - Get port fuel quality index by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Port Fuel Quality Index GET by ID API Debug ===');
    console.log('Port fuel quality index ID:', params.id);
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

    // Get port fuel quality index by ID
    const { data: portFuelQualityIndex, error } = await supabase
      .from('port_fuel_quality_index')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching port fuel quality index:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Port fuel quality index not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch port fuel quality index' }, { status: 500 });
    }

    return NextResponse.json(portFuelQualityIndex);
  } catch (error) {
    console.error('Error in GET /api/fuel-manager/port-fuel-quality-index/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/fuel-manager/port-fuel-quality-index/[id] - Update port fuel quality index
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Port Fuel Quality Index PUT API Debug ===');
    console.log('Port fuel quality index ID:', params.id);
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
    const { qualityParameter, parCoefficient, betweenMinAvg, betweenAvgMax, moreThanMax } = body;

    if (!qualityParameter || parCoefficient === undefined || betweenMinAvg === undefined || betweenAvgMax === undefined || moreThanMax === undefined) {
      return NextResponse.json({ error: 'All fields are required: qualityParameter, parCoefficient, betweenMinAvg, betweenAvgMax, moreThanMax' }, { status: 400 });
    }

    // Update port fuel quality index
    const { data: updatedPortFuelQualityIndex, error } = await supabase
      .from('port_fuel_quality_index')
      .update({
        quality_parameter: qualityParameter,
        par_coefficient: parCoefficient,
        between_min_avg: betweenMinAvg,
        between_avg_max: betweenAvgMax,
        more_than_max: moreThanMax
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating port fuel quality index:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Port fuel quality index not found' }, { status: 404 });
      }
      return NextResponse.json({ 
        error: 'Failed to update port fuel quality index',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Port fuel quality index updated successfully',
      portFuelQualityIndex: updatedPortFuelQualityIndex
    });
  } catch (error) {
    console.error('Error in PUT /api/fuel-manager/port-fuel-quality-index/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update port fuel quality index' },
      { status: 500 }
    );
  }
}

// DELETE /api/fuel-manager/port-fuel-quality-index/[id] - Delete port fuel quality index
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Port Fuel Quality Index DELETE API Debug ===');
    console.log('Port fuel quality index ID:', params.id);
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

    // Delete port fuel quality index
    const { error } = await supabase
      .from('port_fuel_quality_index')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting port fuel quality index:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Port fuel quality index not found' }, { status: 404 });
      }
      return NextResponse.json({ 
        error: 'Failed to delete port fuel quality index',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Port fuel quality index deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/fuel-manager/port-fuel-quality-index/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete port fuel quality index' },
      { status: 500 }
    );
  }
}

