import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { enhanceRouteHandler } from '@kit/next/routes';
import * as XLSX from 'xlsx';
import Decimal from 'decimal.js';

export const POST = enhanceRouteHandler(
  async function ({ user, request }) {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const accountId = formData.get('accountId') as string;

      if (!file || !accountId) {
        return NextResponse.json(
          { error: 'File and account ID are required' },
          { status: 400 }
        );
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

      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Please upload an Excel file.' },
          { status: 400 }
        );
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File is too large. Maximum size is 10MB.' },
          { status: 400 }
        );
      }

      // Read Excel file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON (starting from row 4 as specified)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        range: 3 // Start from row 4 (0-indexed)
      });

      // Extract port name from filename
      const portName = file.name.substring(0, file.name.lastIndexOf('_'));

      // Process data and insert into database
      const fuelQualityData = [];
      for (const row of jsonData) {
        if (row.length < 27) continue; // Skip incomplete rows

        try {
          const data = {
            account_id: accountId,
            port: portName,
            supplier: row[0]?.toString() || null,
            date: row[1] ? new Date(row[1]).toISOString().split('T')[0] : null,
            fuel_type: row[2]?.toString() || null,
            grade: row[3]?.toString() || null,
            density_15c: row[4] ? new Decimal(row[4]).toNumber() : null,
            k_viscosity_50c: row[5] ? new Decimal(row[5]).toNumber() : null,
            flash_point: row[6] ? new Decimal(row[6]).toNumber() : null,
            pour_point: row[7] ? new Decimal(row[7]).toNumber() : null,
            mcr: row[8] ? new Decimal(row[8]).toNumber() : null,
            ash: row[9] ? new Decimal(row[9]).toNumber() : null,
            water_content: row[10] ? new Decimal(row[10]).toNumber() : null,
            sulphur_content: row[11] ? new Decimal(row[11]).toNumber() : null,
            total_sediment: row[12] ? new Decimal(row[12]).toNumber() : null,
            vanadium: row[13] ? new Decimal(row[13]).toNumber() : null,
            sodium: row[14] ? new Decimal(row[14]).toNumber() : null,
            aluminium: row[15] ? new Decimal(row[15]).toNumber() : null,
            silicon: row[16] ? new Decimal(row[16]).toNumber() : null,
            aluminium_silicon: row[17] ? new Decimal(row[17]).toNumber() : null,
            calcium: row[18] ? new Decimal(row[18]).toNumber() : null,
            phosphorus: row[19] ? new Decimal(row[19]).toNumber() : null,
            zinc: row[20] ? new Decimal(row[20]).toNumber() : null,
            iron: row[21] ? new Decimal(row[21]).toNumber() : null,
            nickel: row[22] ? new Decimal(row[22]).toNumber() : null,
            lead: row[23] ? new Decimal(row[23]).toNumber() : null,
            potassium: row[24] ? new Decimal(row[24]).toNumber() : null,
            ccai: row[25] ? new Decimal(row[25]).toNumber() : null,
            net_specific_energy: row[26] ? new Decimal(row[26]).toNumber() : null,
            gross_specific_energy: row[27] ? new Decimal(row[27]).toNumber() : null,
          };

          fuelQualityData.push(data);
        } catch (error) {
          console.error('Error processing row:', row, error);
          continue;
        }
      }

      if (fuelQualityData.length === 0) {
        return NextResponse.json(
          { error: 'No valid data found in the Excel file' },
          { status: 400 }
        );
      }

             // Insert data into database
       const { error: insertError } = await client
         .from('fuel_quality_data')
         .insert(fuelQualityData.map(data => ({
           ...data,
           created_by: user.id,
           updated_by: user.id,
         })));

      if (insertError) {
        console.error('Error inserting fuel quality data:', insertError);
        return NextResponse.json(
          { error: 'Failed to save fuel quality data' },
          { status: 500 }
        );
    }

    return NextResponse.json({ 
        success: true,
        message: `Successfully uploaded ${fuelQualityData.length} records`,
        count: fuelQualityData.length,
    });

  } catch (error) {
      console.error('Error processing Excel upload:', error);
      return NextResponse.json(
        { error: 'Failed to process Excel file' },
        { status: 500 }
      );
    }
  },
  {
    auth: true,
  },
);
