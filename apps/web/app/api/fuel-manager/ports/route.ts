import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/ports - Get all ports
export async function GET(request: NextRequest) {
  try {
    console.log('=== Ports GET API Debug ===');
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

    // Get all ports for the user
    const { data: ports, error } = await supabase
      .from('ports')
      .select(`
        *,
        ships(name)
      `)
      .eq('account_id', user.id)
      .order('port_name', { ascending: true });

    if (error) {
      console.error('Error fetching ports:', error);
      return NextResponse.json({ error: 'Failed to fetch ports' }, { status: 500 });
    }

    return NextResponse.json(ports || []);
  } catch (error) {
    console.error('Error in GET /api/fuel-manager/ports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/fuel-manager/ports - Create a new port
export async function POST(request: NextRequest) {
  try {
    console.log('=== Ports POST API Debug ===');
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
    const { shipId, portName, etaDate } = body;

    if (!shipId || !portName) {
      return NextResponse.json(
        { error: 'Ship ID and port name are required' },
        { status: 400 }
      );
    }

    // Check if ship exists
    const { data: existingShip } = await supabase
      .from('ships')
      .select('id')
      .eq('id', shipId)
      .eq('account_id', user.id)
      .single();

    if (!existingShip) {
      return NextResponse.json(
        { error: 'Ship not found' },
        { status: 404 }
      );
    }

    // Check if port already exists for this ship
    const { data: existingPort } = await supabase
      .from('ports')
      .select('id')
      .eq('port_name', portName)
      .eq('ship_id', shipId)
      .single();

    if (existingPort) {
      return NextResponse.json(
        { error: 'Port already exists for this ship' },
        { status: 400 }
      );
    }

    // Create new port
    const portData: any = {
      ship_id: shipId,
      port_name: portName,
      account_id: user.id,
      created_by: user.id,
      updated_by: user.id
    };

    // Add optional fields
    if (etaDate) {
      portData.eta_date = etaDate;
    }

    const { data: port, error } = await supabase
      .from('ports')
      .insert(portData)
      .select(`
        *,
        ships(name)
      `)
      .single();

    if (error) {
      console.error('Error creating port:', error);
      return NextResponse.json({ error: 'Failed to create port' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Port created successfully',
      port 
    });
  } catch (error) {
    console.error('Error in POST /api/fuel-manager/ports:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create port' },
      { status: 500 }
    );
  }
}
