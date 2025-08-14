const { createClient } = require('@supabase/supabase-js');

// Test configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function testFuelTypesColumn() {
  console.log('🧪 Testing Fuel Types Column...\n');

  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Test creating a ship with fuel_types
    console.log('1. Testing ship creation with fuel_types...');
    const { data: ship, error } = await supabase
      .from('ships')
      .insert({
        name: 'Test Ship with Fuel Types',
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

    if (error) {
      console.error('❌ Error creating ship:', error);
      return;
    }

    console.log('✅ Ship created successfully!');
    console.log('   - Name:', ship.name);
    console.log('   - Fuel Types:', ship.fuel_types);
    console.log('   - All fields:', Object.keys(ship));

    // Test creating a ship with only HFO
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
      console.log('✅ Ship with HFO only created:', ship2.fuel_types);
    }

    // Test invalid fuel type (should fail)
    console.log('\n3. Testing invalid fuel type (should fail)...');
    const { data: ship3, error: error3 } = await supabase
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

    if (error3) {
      console.log('✅ Invalid fuel type correctly rejected:', error3.message);
    } else {
      console.log('❌ Invalid fuel type was not rejected');
    }

    console.log('\n🎉 Fuel types column test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testFuelTypesColumn();
