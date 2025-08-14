import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/fuel-quality/data/[id] - Get fuel quality data by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Fuel Quality Data GET by ID API Debug ===');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Request cookies:', request.cookies.getAll());
    console.log('Fuel Quality Data ID:', params.id);
    
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

    // Get fuel quality data by ID
    const { data: fuelQualityData, error } = await supabase
      .from('fuel_quality_data')
      .select('*')
      .eq('id', params.id)
      .eq('account_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching fuel quality data:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Fuel quality data not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch fuel quality data' }, { status: 500 });
    }

    return NextResponse.json(fuelQualityData);
  } catch (error) {
    console.error('Error in GET /api/fuel-manager/fuel-quality/data/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/fuel-manager/fuel-quality/data/[id] - Update fuel quality data
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Fuel Quality Data PUT API Debug ===');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Request cookies:', request.cookies.getAll());
    console.log('Fuel Quality Data ID:', params.id);
    
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
    const { 
      port,
      supplier,
      date,
      fuelType,
      grade,
      densityFifteenC,
      kViscosityFiftyC,
      pourPoint,
      ash,
      waterContent,
      sulphurContent,
      vanadium,
      sodium,
      aluminiumSilicon,
      totalAcidNumber,
      ccai
    } = body;

    // Update fuel quality data
    const updateData: any = {
      updated_by: user.id
    };

    // Add optional fields
    if (port !== undefined) updateData.port = port;
    if (supplier !== undefined) updateData.supplier = supplier;
    if (date !== undefined) updateData.date = date;
    if (fuelType !== undefined) updateData.fuel_type = fuelType;
    if (grade !== undefined) updateData.grade = grade;
    if (densityFifteenC !== undefined) updateData.density_fifteen_c = densityFifteenC;
    if (kViscosityFiftyC !== undefined) updateData.k_viscosity_fifty_c = kViscosityFiftyC;
    if (pourPoint !== undefined) updateData.pour_point = pourPoint;
    if (ash !== undefined) updateData.ash = ash;
    if (waterContent !== undefined) updateData.water_content = waterContent;
    if (sulphurContent !== undefined) updateData.sulphur_content = sulphurContent;
    if (vanadium !== undefined) updateData.vanadium = vanadium;
    if (sodium !== undefined) updateData.sodium = sodium;
    if (aluminiumSilicon !== undefined) updateData.aluminium_silicon = aluminiumSilicon;
    if (totalAcidNumber !== undefined) updateData.total_acid_number = totalAcidNumber;
    if (ccai !== undefined) updateData.ccai = ccai;

    const { data: updatedFuelQualityData, error } = await supabase
      .from('fuel_quality_data')
      .update(updateData)
      .eq('id', params.id)
      .eq('account_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating fuel quality data:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Fuel quality data not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to update fuel quality data' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Fuel quality data updated successfully',
      fuelQualityData: updatedFuelQualityData 
    });
  } catch (error) {
    console.error('Error in PUT /api/fuel-manager/fuel-quality/data/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update fuel quality data' },
      { status: 500 }
    );
  }
}

// DELETE /api/fuel-manager/fuel-quality/data/[id] - Delete fuel quality data
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Fuel Quality Data DELETE API Debug ===');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Request cookies:', request.cookies.getAll());
    console.log('Fuel Quality Data ID:', params.id);
    
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

    // Delete fuel quality data
    const { error } = await supabase
      .from('fuel_quality_data')
      .delete()
      .eq('id', params.id)
      .eq('account_id', user.id);

    if (error) {
      console.error('Error deleting fuel quality data:', error);
      return NextResponse.json({ error: 'Failed to delete fuel quality data' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Fuel quality data deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/fuel-manager/fuel-quality/data/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete fuel quality data' },
      { status: 500 }
    );
  }
}
