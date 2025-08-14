import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/ports/[id] - Get port by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Port GET by ID API Debug ===');
    console.log('Port ID:', params.id);
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

    // Get port by ID
    const { data: port, error } = await supabase
      .from('ports')
      .select('*')
      .eq('id', params.id)
      .eq('account_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching port:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Port not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch port' }, { status: 500 });
    }

    return NextResponse.json(port);
  } catch (error) {
    console.error('Error in GET /api/fuel-manager/ports/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/fuel-manager/ports/[id] - Update port by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Port PUT by ID API Debug ===');
    console.log('Port ID:', params.id);
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
    const { name, location, country, fuelTypes } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Update port
    const { data: port, error } = await supabase
      .from('ports')
      .update({
        name,
        location,
        country,
        fuel_types: fuelTypes,
        updated_by: user.id
      })
      .eq('id', params.id)
      .eq('account_id', user.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating port:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Port not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to update port' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Port updated successfully',
      port 
    });
  } catch (error) {
    console.error('Error in PUT /api/fuel-manager/ports/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/fuel-manager/ports/[id] - Delete port by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Port DELETE by ID API Debug ===');
    console.log('Port ID:', params.id);
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

    // Check if port exists and belongs to user
    const { data: existingPort, error: checkError } = await supabase
      .from('ports')
      .select('id')
      .eq('id', params.id)
      .eq('account_id', user.id)
      .single();

    if (checkError) {
      console.error('Error checking port:', checkError);
      if (checkError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Port not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to check port' }, { status: 500 });
    }

    // Delete port
    const { error } = await supabase
      .from('ports')
      .delete()
      .eq('id', params.id)
      .eq('account_id', user.id);

    if (error) {
      console.error('Error deleting port:', error);
      return NextResponse.json({ error: 'Failed to delete port' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Port deleted successfully' 
    });
  } catch (error) {
    console.error('Error in DELETE /api/fuel-manager/ports/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
