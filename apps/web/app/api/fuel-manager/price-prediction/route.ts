import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/price-prediction - Get all price prediction files
export async function GET(request: NextRequest) {
  try {
    console.log('=== Price Prediction GET API Debug ===');
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

    // Get all price prediction files for the user (using user ID as account_id)
    const { data: files, error } = await supabase
      .from('price_prediction_files')
      .select('*')
      .eq('account_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching price prediction files:', error);
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }

    // Transform data to match the expected response format
    const response = files.map(file => ({
      id: file.id,
      fileName: file.file_name,
      storageKey: file.storage_key,
      fileSize: file.file_size,
      mimeType: file.mime_type,
      predictions: file.predictions,
      isActive: file.is_active,
      processedAt: file.processed_at,
      createdAt: file.created_at,
      updatedAt: file.updated_at
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/fuel-manager/price-prediction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/fuel-manager/price-prediction/upload - Upload a new file
export async function POST(request: NextRequest) {
  try {
    console.log('=== Price Prediction POST API Debug ===');
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check if file is Excel or CSV
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      return NextResponse.json({ error: 'Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed' }, { status: 400 });
    }

    // Generate storage key using user ID and timestamp
    const timestamp = Date.now();
    const storageKey = `${user.id}/${timestamp}_${file.name}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('fuel-manager-files')
      .upload(storageKey, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      console.error('Storage key:', storageKey);
      console.error('File name:', file.name);
      console.error('File size:', file.size);
      console.error('File type:', file.type);
      return NextResponse.json({ 
        error: 'Failed to upload file',
        details: uploadError.message,
        storageKey: storageKey
      }, { status: 500 });
    }

    console.log('File uploaded successfully to storage');
    console.log('Storage key:', storageKey);
    console.log('File name:', file.name);
    console.log('File size:', file.size);
    console.log('File type:', file.type);

    // Save file metadata to database
    const { data: dbData, error: dbError } = await supabase
      .from('price_prediction_files')
      .insert({
        account_id: user.id,
        file_name: file.name,
        storage_key: storageKey,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving file metadata:', dbError);
      console.error('User ID:', user.id);
      console.error('File name:', file.name);
      console.error('Storage key:', storageKey);
      console.error('File size:', file.size);
      console.error('MIME type:', file.type);
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('fuel-manager-files')
        .remove([storageKey]);
      return NextResponse.json({ 
        error: 'Failed to save file metadata',
        details: dbError.message,
        code: dbError.code
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      fileId: dbData.id 
    });
  } catch (error) {
    console.error('Error in POST /api/fuel-manager/price-prediction/upload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
