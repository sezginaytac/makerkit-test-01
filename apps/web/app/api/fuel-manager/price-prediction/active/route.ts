import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { cookies } from 'next/headers';

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/fuel-manager/price-prediction/active - Get the first active prediction list
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabaseClient = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
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

    // Get the first active prediction file for this account
    const { data: activeFile, error: fetchError } = await supabase
      .from('price_prediction_files')
      .select('*')
      .eq('account_id', membership.account_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // No active file found
        return NextResponse.json({ 
          message: 'No active prediction file found',
          predictions: null
        });
      }
      console.error('Error fetching active file:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch active file' }, { status: 500 });
    }

    if (!activeFile) {
      return NextResponse.json({ 
        message: 'No active prediction file found',
        predictions: null
      });
    }

    // Parse predictions JSON
    let predictions;
    try {
      predictions = activeFile.predictions ? JSON.parse(activeFile.predictions) : null;
    } catch (parseError) {
      console.error('Error parsing predictions JSON:', parseError);
      return NextResponse.json({ error: 'Invalid predictions data' }, { status: 500 });
    }

    return NextResponse.json({
      file: {
        id: activeFile.id,
        fileName: activeFile.file_name,
        isActive: activeFile.is_active,
        processedAt: activeFile.processed_at,
        createdAt: activeFile.created_at
      },
      predictions: predictions
    });

  } catch (error) {
    console.error('Error in GET /api/fuel-manager/price-prediction/active:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
