import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET /api/fuel-manager/fuel-inventory/[shipId] - Get fuel inventory data for specific ship
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shipId: string }> }
) {
  try {
    console.log('🔍 === Fuel Inventory GET by Ship ID API Debug ===');
    
    const { shipId } = await params;
    console.log('🔍 Ship ID:', shipId);
    
    const supabase = getSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🔍 Auth result - user:', user ? 'exists' : 'null');
    console.log('🔍 Auth result - error:', authError);
    
    if (authError || !user) {
      console.log('🔍 Authentication failed - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, get the ship to find its account_id
    console.log('🔍 Querying ship with ID:', shipId);
    const { data: ship, error: shipError } = await supabase
      .from('ships')
      .select('account_id')
      .eq('id', shipId)
      .single();

    console.log('🔍 Ship query result:', ship);
    console.log('🔍 Ship query error:', shipError);
    console.log('🔍 Ship account_id:', ship?.account_id);

    if (shipError || !ship) {
      console.log('🔍 Ship not found - returning 404');
      return NextResponse.json({ error: 'Ship not found' }, { status: 404 });
    }

    // Get fuel inventory data for the specific ship using the ship's account_id
    console.log('🔍 Querying fuel inventory with ship_id:', shipId, 'and account_id:', ship.account_id);
    const { data: fuelInventory, error } = await supabase
      .from('fuel_inventory')
      .select('*')
      .eq('ship_id', shipId)
      .eq('account_id', ship.account_id)
      .order('created_at', { ascending: false });

    console.log('🔍 Fuel inventory query result:', fuelInventory);
    console.log('🔍 Fuel inventory query error:', error);

    if (error) {
      console.log('🔍 Database error - returning 500');
      return NextResponse.json({ error: 'Failed to fetch fuel inventory data' }, { status: 500 });
    }

    console.log('🔍 Returning fuel inventory data:', fuelInventory);
    return NextResponse.json(fuelInventory || []);
  } catch (error) {
    console.error('🔍 Error in fuel inventory GET by ship ID:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
