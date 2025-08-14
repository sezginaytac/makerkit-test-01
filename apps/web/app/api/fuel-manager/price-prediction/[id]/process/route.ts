import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { cookies } from 'next/headers';

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/fuel-manager/price-prediction/[id]/process - Process a price prediction file
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Price Prediction Process API Debug ===');
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

    // Get the file from database
    const { data: file, error: fetchError } = await supabase
      .from('price_prediction_files')
      .select('*')
      .eq('id', fileId)
      .eq('account_id', membership.account_id)
      .single();

    if (fetchError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('fuel-manager-files')
      .download(file.storage_key);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }

    // Convert file to buffer for Python API
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call Python AI API for prediction
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';
    
    try {
      const formData = new FormData();
      formData.append('file', new Blob([buffer]), file.file_name);

      const response = await fetch(`${pythonApiUrl}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Python API responded with status: ${response.status}`);
      }

      const predictions = await response.json();

      // Update database with predictions
      const { error: updateError } = await supabase
        .from('price_prediction_files')
        .update({
          predictions: predictions,
          processed_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('id', fileId);

      if (updateError) {
        console.error('Error updating predictions:', updateError);
        return NextResponse.json({ error: 'Failed to save predictions' }, { status: 500 });
      }

      return NextResponse.json({ 
        message: 'File processed successfully',
        predictions: predictions
      });

    } catch (pythonApiError) {
      console.error('Error calling Python API:', pythonApiError);
      return NextResponse.json({ 
        error: 'Failed to process file with AI model',
        details: pythonApiError instanceof Error ? pythonApiError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in POST /api/fuel-manager/price-prediction/[id]/process:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
