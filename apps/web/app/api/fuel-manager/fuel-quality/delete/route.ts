import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { cookies } from 'next/headers';
import { FuelQualityService } from '@kit/fuel-manager';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fuelQualityService = new FuelQualityService();
    
    // Delete the fuel quality data
    await fuelQualityService.deleteData(params.id, user.id);

    return NextResponse.json({ message: 'Fuel quality data deleted successfully' });
  } catch (error) {
    console.error('Error deleting fuel quality data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete fuel quality data' },
      { status: 500 }
    );
  }
}
