import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/port-fuel-quality-value/[id] - Get port fuel quality value by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Port Fuel Quality Value GET by ID API Debug ===');
    console.log('Port fuel quality value ID:', params.id);
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

    // Get port fuel quality value by ID
    const { data: portFuelQualityValue, error } = await supabase
      .from('port_fuel_quality_value')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching port fuel quality value:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Port fuel quality value not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch port fuel quality value' }, { status: 500 });
    }

    return NextResponse.json(portFuelQualityValue);
  } catch (error) {
    console.error('Error in GET /api/fuel-manager/port-fuel-quality-value/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/fuel-manager/port-fuel-quality-value/[id] - Update port fuel quality value
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Port Fuel Quality Value PUT API Debug ===');
    console.log('Port fuel quality value ID:', params.id);
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
    const { qualityParameter, parCoefficient, betweenMinAvg, betweenAvgMax, moreThanMax, fuelType, grade, date } = body;

    if (!qualityParameter || parCoefficient === undefined || betweenMinAvg === undefined || betweenAvgMax === undefined || moreThanMax === undefined) {
      return NextResponse.json({ error: 'Required fields are missing: qualityParameter, parCoefficient, betweenMinAvg, betweenAvgMax, moreThanMax' }, { status: 400 });
    }

    // Update port fuel quality value
    const { data: updatedPortFuelQualityValue, error } = await supabase
      .from('port_fuel_quality_value')
      .update({
        quality_parameter: qualityParameter,
        par_coefficient: parCoefficient,
        between_min_avg: betweenMinAvg,
        between_avg_max: betweenAvgMax,
        more_than_max: moreThanMax,
        fuel_type: fuelType,
        grade: grade,
        date: date
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating port fuel quality value:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Port fuel quality value not found' }, { status: 404 });
      }
      return NextResponse.json({ 
        error: 'Failed to update port fuel quality value',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Port fuel quality value updated successfully',
      portFuelQualityValue: updatedPortFuelQualityValue
    });
  } catch (error) {
    console.error('Error in PUT /api/fuel-manager/port-fuel-quality-value/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update port fuel quality value' },
      { status: 500 }
    );
  }
}

// DELETE /api/fuel-manager/port-fuel-quality-value/[id] - Delete port fuel quality value
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Port Fuel Quality Value DELETE API Debug ===');
    console.log('Port fuel quality value ID:', params.id);
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

    // Delete port fuel quality value
    const { error } = await supabase
      .from('port_fuel_quality_value')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting port fuel quality value:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Port fuel quality value not found' }, { status: 404 });
      }
      return NextResponse.json({ 
        error: 'Failed to delete port fuel quality value',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Port fuel quality value deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/fuel-manager/port-fuel-quality-value/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete port fuel quality value' },
      { status: 500 }
    );
  }
}

