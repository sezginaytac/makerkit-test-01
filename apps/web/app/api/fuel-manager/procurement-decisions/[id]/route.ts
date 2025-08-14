import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/procurement-decisions/[id] - Get procurement decision by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Procurement Decision GET by ID API Debug ===');
    console.log('Procurement decision ID:', params.id);
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

    // Get procurement decision by ID
    const { data: procurementDecision, error } = await supabase
      .from('procurement_decisions')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching procurement decision:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Procurement decision not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch procurement decision' }, { status: 500 });
    }

    return NextResponse.json(procurementDecision);
  } catch (error) {
    console.error('Error in GET /api/fuel-manager/procurement-decisions/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/fuel-manager/procurement-decisions/[id] - Update procurement decision
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Procurement Decision PUT API Debug ===');
    console.log('Procurement decision ID:', params.id);
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

    // Update procurement decision
    const { data: updatedProcurementDecision, error } = await supabase
      .from('procurement_decisions')
      .update({
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
        user_id: userId
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating procurement decision:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Procurement decision not found' }, { status: 404 });
      }
      return NextResponse.json({ 
        error: 'Failed to update procurement decision',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Procurement decision updated successfully',
      procurementDecision: updatedProcurementDecision
    });
  } catch (error) {
    console.error('Error in PUT /api/fuel-manager/procurement-decisions/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update procurement decision' },
      { status: 500 }
    );
  }
}

// DELETE /api/fuel-manager/procurement-decisions/[id] - Delete procurement decision
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Procurement Decision DELETE API Debug ===');
    console.log('Procurement decision ID:', params.id);
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

    // Delete procurement decision
    const { error } = await supabase
      .from('procurement_decisions')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting procurement decision:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Procurement decision not found' }, { status: 404 });
      }
      return NextResponse.json({ 
        error: 'Failed to delete procurement decision',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Procurement decision deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/fuel-manager/procurement-decisions/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete procurement decision' },
      { status: 500 }
    );
  }
}
