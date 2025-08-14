import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/port-fuel-quality-index - Get all port fuel quality index data
export async function GET(request: NextRequest) {
  try {
    console.log('=== Port Fuel Quality Index GET API Debug ===');
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

    // Get all port fuel quality index data
    const { data: portFuelQualityIndex, error } = await supabase
      .from('port_fuel_quality_index')
      .select('*')
      .order('quality_parameter', { ascending: true });

    if (error) {
      console.error('Error fetching port fuel quality index:', error);
      return NextResponse.json({ error: 'Failed to fetch port fuel quality index' }, { status: 500 });
    }

    return NextResponse.json(portFuelQualityIndex || []);
  } catch (error) {
    console.error('Error in GET /api/fuel-manager/port-fuel-quality-index:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/fuel-manager/port-fuel-quality-index - Create new port fuel quality index
export async function POST(request: NextRequest) {
  try {
    console.log('=== Port Fuel Quality Index POST API Debug ===');
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

    // Create new port fuel quality index
    const { data: newPortFuelQualityIndex, error } = await supabase
      .from('port_fuel_quality_index')
      .insert({
        quality_parameter: qualityParameter,
        par_coefficient: parCoefficient,
        between_min_avg: betweenMinAvg,
        between_avg_max: betweenAvgMax,
        more_than_max: moreThanMax
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating port fuel quality index:', error);
      return NextResponse.json({ 
        error: 'Failed to create port fuel quality index',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Port fuel quality index created successfully',
      portFuelQualityIndex: newPortFuelQualityIndex
    });
  } catch (error) {
    console.error('Error in POST /api/fuel-manager/port-fuel-quality-index:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create port fuel quality index' },
      { status: 500 }
    );
  }
}

