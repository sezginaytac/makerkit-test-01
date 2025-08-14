import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/ports/by-name/[name] - Get port by name
export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    console.log('=== Get Port by Name API Debug ===');
    console.log('Port name:', params.name);
    
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

    // Get port by name
    const { data: port, error } = await supabase
      .from('ports')
      .select(`
        *,
        ships(name)
      `)
      .eq('port_name', decodeURIComponent(params.name))
      .eq('account_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: `Port not found with name: ${decodeURIComponent(params.name)}` },
          { status: 404 }
        );
      }
      console.error('Error fetching port:', error);
      return NextResponse.json({ error: 'Failed to fetch port' }, { status: 500 });
    }

    return NextResponse.json(port);
  } catch (error) {
    console.error('Error in GET /api/fuel-manager/ports/by-name/[name]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
