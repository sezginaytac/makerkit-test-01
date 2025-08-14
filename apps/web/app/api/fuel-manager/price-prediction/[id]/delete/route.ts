import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { cookies } from 'next/headers';

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// DELETE /api/fuel-manager/price-prediction/[id]/delete - Delete a price prediction file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Price Prediction Delete API Debug ===');
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

    // Get the file from database to get storage key
    const { data: file, error: fetchError } = await supabase
      .from('price_prediction_files')
      .select('storage_key')
      .eq('id', fileId)
      .eq('account_id', membership.account_id)
      .single();

    if (fetchError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('fuel-manager-files')
      .remove([file.storage_key]);

    // Delete file record from database
    const { error: dbError } = await supabase
      .from('price_prediction_files')
      .delete()
      .eq('id', fileId)
      .eq('account_id', membership.account_id);

    if (dbError) {
      console.error('Error deleting file from database:', dbError);
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/fuel-manager/price-prediction/[id]/delete:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
