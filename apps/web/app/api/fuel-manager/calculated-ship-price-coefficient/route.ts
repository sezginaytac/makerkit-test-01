import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/calculated-ship-price-coefficient - Get all calculated ship price coefficients
export async function GET(request: NextRequest) {
  try {
    console.log('=== Calculated Ship Price Coefficient GET API Debug ===');
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

    // Get all calculated ship price coefficients for the user
    const { data: coefficients, error } = await supabase
      .from('calculated_ship_price_coefficient')
      .select(`
        *,
        ships(name)
      `)
      .eq('account_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching calculated ship price coefficients:', error);
      return NextResponse.json({ error: 'Failed to fetch calculated ship price coefficients' }, { status: 500 });
    }

    return NextResponse.json(coefficients || []);
  } catch (error) {
    console.error('Error in GET /api/fuel-manager/calculated-ship-price-coefficient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/fuel-manager/calculated-ship-price-coefficient - Create a new calculated ship price coefficient
export async function POST(request: NextRequest) {
  try {
    console.log('=== Calculated Ship Price Coefficient POST API Debug ===');
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
      shipId, 
      priceIndex, 
      priceAndQualityIndicator, 
      finalDecision, 
      bestPrice,
      shipInventoryIndex,
      qualityIndex,
      fuelType,
      port,
      etaDate,
      priceDate
    } = body;

    if (!shipId) {
      return NextResponse.json(
        { error: 'Ship ID is required' },
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

    // Create new calculated ship price coefficient
    const coefficientData: any = {
      ship_id: shipId,
      account_id: user.id,
      created_by: user.id,
      updated_by: user.id
    };

    // Add optional fields
    if (priceIndex !== undefined) coefficientData.price_index = priceIndex;
    if (priceAndQualityIndicator) coefficientData.price_and_quality_indicator = priceAndQualityIndicator;
    if (finalDecision) coefficientData.final_decision = finalDecision;
    if (bestPrice !== undefined) coefficientData.best_price = bestPrice;
    if (shipInventoryIndex !== undefined) coefficientData.ship_inventory_index = shipInventoryIndex;
    if (qualityIndex !== undefined) coefficientData.quality_index = qualityIndex;
    if (fuelType) coefficientData.fuel_type = fuelType;
    if (port) coefficientData.port = port;
    if (etaDate) coefficientData.eta_date = etaDate;
    if (priceDate) coefficientData.price_date = priceDate;

    const { data: coefficient, error } = await supabase
      .from('calculated_ship_price_coefficient')
      .insert(coefficientData)
      .select(`
        *,
        ships(name)
      `)
      .single();

    if (error) {
      console.error('Error creating calculated ship price coefficient:', error);
      return NextResponse.json({ error: 'Failed to create calculated ship price coefficient' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Calculated ship price coefficient created successfully',
      coefficient 
    });
  } catch (error) {
    console.error('Error in POST /api/fuel-manager/calculated-ship-price-coefficient:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create calculated ship price coefficient' },
      { status: 500 }
    );
  }
}


