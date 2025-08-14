const { createClient } = require('@supabase/supabase-js');

// Test configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function testFuelTypes() {
  console.log('🧪 Testing Fuel Types Functionality...\n');

  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // 1. Test creating a ship with all fuel types
    console.log('1. Testing ship creation with all fuel types...');
    const { data: ship1, error: error1 } = await supabase
      .from('ships')
      .insert({
        name: 'Test Ship All Fuels',
        imo_number: 'IMO1234567',
        vessel_type: 'Container',
        capacity: 50000,
        fuel_consumption_rate: 25.5,
        fuel_types: 'HFO,VLSFO,MGO',
        account_id: 'test-account-id',
        created_by: 'test-user-id',
        updated_by: 'test-user-id'
      })
      .select()
      .single();

    if (error1) {
      console.error('❌ Error creating ship with all fuel types:', error1);
    } else {
      console.log('✅ Ship created with all fuel types:', ship1.fuel_types);
    }

    // 2. Test creating a ship with only HFO
    console.log('\n2. Testing ship creation with HFO only...');
    const { data: ship2, error: error2 } = await supabase
      .from('ships')
      .insert({
        name: 'Test Ship HFO Only',
        imo_number: 'IMO7654321',
        vessel_type: 'Tanker',
        capacity: 30000,
        fuel_consumption_rate: 45.0,
        fuel_types: 'HFO',
        account_id: 'test-account-id',
        created_by: 'test-user-id',
        updated_by: 'test-user-id'
      })
      .select()
      .single();

    if (error2) {
      console.error('❌ Error creating ship with HFO only:', error2);
    } else {
      console.log('✅ Ship created with HFO only:', ship2.fuel_types);
    }

    // 3. Test creating a ship with VLSFO and MGO
    console.log('\n3. Testing ship creation with VLSFO and MGO...');
    const { data: ship3, error: error3 } = await supabase
      .from('ships')
      .insert({
        name: 'Test Ship VLSFO MGO',
        imo_number: 'IMO9876543',
        vessel_type: 'Container',
        capacity: 15000,
        fuel_consumption_rate: 35.0,
        fuel_types: 'VLSFO,MGO',
        account_id: 'test-account-id',
        created_by: 'test-user-id',
        updated_by: 'test-user-id'
      })
      .select()
      .single();

    if (error3) {
      console.error('❌ Error creating ship with VLSFO and MGO:', error3);
    } else {
      console.log('✅ Ship created with VLSFO and MGO:', ship3.fuel_types);
    }

    // 4. Test invalid fuel type (should fail)
    console.log('\n4. Testing invalid fuel type (should fail)...');
    const { data: ship4, error: error4 } = await supabase
      .from('ships')
      .insert({
        name: 'Test Ship Invalid',
        imo_number: 'IMO1111111',
        vessel_type: 'Bulk',
        capacity: 20000,
        fuel_consumption_rate: 40.0,
        fuel_types: 'HFO,INVALID',
        account_id: 'test-account-id',
        created_by: 'test-user-id',
        updated_by: 'test-user-id'
      })
      .select()
      .single();

    if (error4) {
      console.log('✅ Invalid fuel type correctly rejected:', error4.message);
    } else {
      console.log('❌ Invalid fuel type was not rejected');
    }

    // 5. Test updating a ship's fuel types
    if (ship1) {
      console.log('\n5. Testing fuel types update...');
      const { data: updatedShip, error: updateError } = await supabase
        .from('ships')
        .update({
          fuel_types: 'HFO,MGO',
          updated_by: 'test-user-id'
        })
        .eq('id', ship1.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating ship fuel types:', updateError);
      } else {
        console.log('✅ Ship fuel types updated:', updatedShip.fuel_types);
      }
    }

    // 6. Test retrieving ships and parsing fuel types
    console.log('\n6. Testing fuel types retrieval and parsing...');
    const { data: ships, error: fetchError } = await supabase
      .from('ships')
      .select('*')
      .like('name', 'Test Ship%');

    if (fetchError) {
      console.error('❌ Error fetching ships:', fetchError);
    } else {
      console.log('✅ Retrieved ships:');
      ships.forEach(ship => {
        const fuelTypes = ship.fuel_types.split(',').map(t => t.trim());
        console.log(`   - ${ship.name}: [${fuelTypes.join(', ')}]`);
      });
    }

    console.log('\n🎉 Fuel types testing completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testFuelTypes();
