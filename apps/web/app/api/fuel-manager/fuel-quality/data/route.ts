import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { enhanceRouteHandler } from '@kit/next/routes';

export const GET = enhanceRouteHandler(
  async function ({ user, request }) {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const client = getSupabaseServerClient();

    // Check if user has access to this account
    const { data: membership, error: membershipError } = await client
      .from('accounts_memberships')
      .select('*')
      .eq('account_id', accountId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch fuel quality data
    const { data, error } = await client
      .from('fuel_quality_data')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching fuel quality data:', error);
      return NextResponse.json({ error: 'Failed to fetch fuel quality data' }, { status: 500 });
    }

    return NextResponse.json(data);
  },
  {
    auth: true,
  },
);

// POST /api/fuel-manager/fuel-quality/data - Create new fuel quality data
export async function POST(request: NextRequest) {
  try {
    console.log('=== Fuel Quality Data POST API Debug ===');
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

    // Create new fuel quality data
    const fuelQualityData: any = {
      account_id: user.id,
      created_by: user.id,
      updated_by: user.id
    };

    // Add optional fields
    if (port) fuelQualityData.port = port;
    if (supplier) fuelQualityData.supplier = supplier;
    if (date) fuelQualityData.date = date;
    if (fuelType) fuelQualityData.fuel_type = fuelType;
    if (grade) fuelQualityData.grade = grade;
    if (densityFifteenC !== undefined) fuelQualityData.density_fifteen_c = densityFifteenC;
    if (kViscosityFiftyC !== undefined) fuelQualityData.k_viscosity_fifty_c = kViscosityFiftyC;
    if (pourPoint !== undefined) fuelQualityData.pour_point = pourPoint;
    if (ash !== undefined) fuelQualityData.ash = ash;
    if (waterContent !== undefined) fuelQualityData.water_content = waterContent;
    if (sulphurContent !== undefined) fuelQualityData.sulphur_content = sulphurContent;
    if (vanadium !== undefined) fuelQualityData.vanadium = vanadium;
    if (sodium !== undefined) fuelQualityData.sodium = sodium;
    if (aluminiumSilicon !== undefined) fuelQualityData.aluminium_silicon = aluminiumSilicon;
    if (totalAcidNumber !== undefined) fuelQualityData.total_acid_number = totalAcidNumber;
    if (ccai !== undefined) fuelQualityData.ccai = ccai;

    console.log('Fuel quality data to insert:', fuelQualityData);

    const { data: newFuelQualityData, error } = await supabase
      .from('fuel_quality_data')
      .insert(fuelQualityData)
      .select()
      .single();

    if (error) {
      console.error('Error creating fuel quality data:', error);
      return NextResponse.json({ 
        error: 'Failed to create fuel quality data',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Fuel quality data created successfully',
      fuelQualityData: newFuelQualityData 
    });
  } catch (error) {
    console.error('Error in POST /api/fuel-manager/fuel-quality/data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create fuel quality data' },
      { status: 500 }
    );
  }
}
