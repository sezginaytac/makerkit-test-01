import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// POST /api/fuel-manager/ports - Create new port entry
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ship_id, port_name, eta_date, accountId } = body;

    // Validate required fields
    if (!ship_id || !port_name || !eta_date || !accountId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate that user has access to this account
    const { data: membership, error: membershipError } = await supabase
      .from('accounts_memberships')
      .select('*')
      .eq('account_id', accountId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Validate that the ship belongs to the account
    const { data: ship, error: shipError } = await supabase
      .from('ships')
      .select('id')
      .eq('id', ship_id)
      .eq('account_id', accountId)
      .single();

    if (shipError || !ship) {
      return NextResponse.json({ error: 'Ship not found or access denied' }, { status: 404 });
    }

    // Create new port entry
    const { data, error } = await supabase
      .from('ports')
      .insert({
        account_id: accountId,
        ship_id,
        port_name,
        eta_date: new Date(eta_date).toISOString(),
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create port entry' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/fuel-manager/ports - Get all ports for account
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get accountId from query params
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
    }

    // Validate that user has access to this account
    const { data: membership, error: membershipError } = await supabase
      .from('accounts_memberships')
      .select('*')
      .eq('account_id', accountId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all ports for the account
    const { data: ports, error } = await supabase
      .from('ports')
      .select(`
        *,
        ships(name, imo_number)
      `)
      .eq('account_id', accountId)
      .order('eta_date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch ports' }, { status: 500 });
    }

    return NextResponse.json(ports || []);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
