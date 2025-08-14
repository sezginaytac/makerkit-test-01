import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/procurement-decisions - Get all procurement decisions
export async function GET(request: NextRequest) {
  try {
    console.log('=== Procurement Decisions GET API Debug ===');
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

    // Get all procurement decisions
    const { data: procurementDecisions, error } = await supabase
      .from('procurement_decisions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching procurement decisions:', error);
      return NextResponse.json({ error: 'Failed to fetch procurement decisions' }, { status: 500 });
    }

    return NextResponse.json(procurementDecisions || []);
  } catch (error) {
    console.error('Error in GET /api/fuel-manager/procurement-decisions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/fuel-manager/procurement-decisions - Create new procurement decision
export async function POST(request: NextRequest) {
  try {
    console.log('=== Procurement Decisions POST API Debug ===');
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
      portOfCall, 
      eta, 
      fuelType, 
      priceIndex, 
      qualityIndex, 
      priceQualityIndicator, 
      shipInventoryIndex, 
      finalDecision, 
      bestPrice, 
      priceDate,
      shipId,
      userId 
    } = body;

    // Create new procurement decision
    const { data: newProcurementDecision, error } = await supabase
      .from('procurement_decisions')
      .insert({
        port_of_call: portOfCall,
        eta: eta,
        fuel_type: fuelType,
        price_index: priceIndex,
        quality_index: qualityIndex,
        price_quality_indicator: priceQualityIndicator,
        ship_inventory_index: shipInventoryIndex,
        final_decision: finalDecision,
        best_price: bestPrice,
        price_date: priceDate,
        ship_id: shipId,
        user_id: userId || user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating procurement decision:', error);
      return NextResponse.json({ 
        error: 'Failed to create procurement decision',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Procurement decision created successfully',
      procurementDecision: newProcurementDecision
    });
  } catch (error) {
    console.error('Error in POST /api/fuel-manager/procurement-decisions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create procurement decision' },
      { status: 500 }
    );
  }
}
