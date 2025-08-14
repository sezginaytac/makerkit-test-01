import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { cookies } from 'next/headers';
import { FuelQualityService } from '@kit/fuel-manager';

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const fuelQualityService = new FuelQualityService();
    
    // Update the fuel quality data
    const updatedData = await fuelQualityService.updateData(
      id, 
      updateData, 
      user.id
    );

    return NextResponse.json({ 
      message: 'Fuel quality data updated successfully',
      data: updatedData
    });
  } catch (error) {
    console.error('Error updating fuel quality data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update fuel quality data' },
      { status: 500 }
    );
  }
}
