import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// POST /api/fuel-manager/fuel-inventory - Create or update fuel inventory data
export async function POST(request: NextRequest) {
  try {
    const { fuelData, accountId } = await request.json();

    if (!fuelData || !Array.isArray(fuelData) || fuelData.length === 0) {
      return NextResponse.json({ error: 'Invalid fuel data' }, { status: 400 });
    }

    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check membership
    const { data: membership, error: membershipError } = await supabase
      .from('accounts_memberships')
      .select('*')
      .eq('account_id', accountId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const results = [];
    const errors = [];

    for (const data of fuelData) {
      const { ship_id, fuel_type, rob, me, ae, boiler, port_id } = data;

      if (!ship_id || !fuel_type) {
        const error = `Missing required fields for fuel type ${fuel_type}`;
        errors.push(error);
        continue;
      }

      const { data: ship, error: shipError } = await supabase
        .from('ships')
        .select('id')
        .eq('id', ship_id)
        .eq('account_id', accountId)
        .single();

      if (shipError || !ship) {
        const error = `Ship not found or access denied for fuel type ${fuel_type}`;
        errors.push(error);
        continue;
      }

      const { data: existingData, error: fetchError } = await supabase
        .from('fuel_inventory')
        .select('*')
        .eq('ship_id', ship_id)
        .eq('fuel_type', fuel_type)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        const error = `Database error for fuel type ${fuel_type}: ${fetchError.message}`;
        errors.push(error);
        continue;
      }

      if (existingData) {
        console.log('🔍 Fuel Inventory API: Updating existing record');
        const { data: updatedData, error: updateError } = await supabase
          .from('fuel_inventory')
          .update({
            rob: rob || 0,
            me: me || 0,
            ae: ae || 0,
            boiler: boiler || 0,
            port_id: port_id || null,
            updated_by: user.id,
          })
          .eq('id', existingData.id)
          .select()
          .single();

        if (updateError) {
          const error = `Failed to update fuel data for ${fuel_type}: ${updateError.message}`;
          errors.push(error);
        } else {
          results.push(updatedData);
        }
      } else {
        const { data: newData, error: insertError } = await supabase
          .from('fuel_inventory')
          .insert({
            account_id: accountId,
            ship_id,
            fuel_type,
            rob: rob || 0,
            me: me || 0,
            ae: ae || 0,
            boiler: boiler || 0,
            port_id: port_id || null,
            created_by: user.id,
            updated_by: user.id,
          })
          .select()
          .single();

        if (insertError) {
          const error = `Failed to create fuel data for ${fuel_type}: ${insertError.message}`;
          errors.push(error);
        } else {
          results.push(newData);
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Some operations failed', 
        details: errors,
        results 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Fuel data updated successfully', 
      results 
    });

  } catch (error) {
    console.error('Fuel Inventory API: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/fuel-manager/fuel-inventory - Get all fuel inventory data for account
export async function GET(request: NextRequest) {
  try {
    
    const supabase = getSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all fuel inventory data for the user's account
    const { data: fuelInventory, error } = await supabase
      .from('fuel_inventory')
      .select(`
        *,
        ships(name, imo_number, vessel_type)
      `)
      .eq('account_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching fuel inventory:', error);
      return NextResponse.json({ error: 'Failed to fetch fuel inventory' }, { status: 500 });
    }

    return NextResponse.json(fuelInventory || []);
  } catch (error) {
    console.error('Error in fuel inventory GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
