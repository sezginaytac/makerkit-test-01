import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { cookies } from 'next/headers';

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/fuel-manager/price-prediction/[id]/use - Set a file as active
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Price Prediction Use API Debug ===');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Request cookies:', request.cookies.getAll());
    
    // Try to get JWT token from Authorization header first
    const authHeader = request.headers.get('authorization');
    let supabaseClient;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log('Using Authorization header for authentication');
      const token = authHeader.substring(7);
      
      // Create client with JWT token
      supabaseClient = createClient(
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
      const cookieStore = await cookies();
      supabaseClient = createRouteHandlerClient({ cookies: () => cookieStore });
    }
    
    // Get current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    console.log('Auth result - user:', user ? 'exists' : 'null');
    console.log('Auth result - error:', authError);
    
    if (authError || !user) {
      console.log('Authentication failed - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's account ID
    const { data: membership } = await supabaseClient
      .from('memberships')
      .select('account_id')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'No account found' }, { status: 404 });
    }

    const fileId = params.id;

    // First, deactivate all other files for this account
    const { error: deactivateError } = await supabase
      .from('price_prediction_files')
      .update({ 
        is_active: false,
        updated_by: user.id
      })
      .eq('account_id', membership.account_id);

    if (deactivateError) {
      console.error('Error deactivating other files:', deactivateError);
      return NextResponse.json({ error: 'Failed to deactivate other files' }, { status: 500 });
    }

    // Then, activate the specified file
    const { data: file, error: activateError } = await supabase
      .from('price_prediction_files')
      .update({ 
        is_active: true,
        updated_by: user.id
      })
      .eq('id', fileId)
      .eq('account_id', membership.account_id)
      .select()
      .single();

    if (activateError || !file) {
      console.error('Error activating file:', activateError);
      return NextResponse.json({ error: 'Failed to activate file' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'File activated successfully',
      file: {
        id: file.id,
        fileName: file.file_name,
        isActive: file.is_active,
        updatedAt: file.updated_at
      }
    });

  } catch (error) {
    console.error('Error in POST /api/fuel-manager/price-prediction/[id]/use:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
