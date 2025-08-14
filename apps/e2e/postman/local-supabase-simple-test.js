// Local Supabase için basit test script'i
const SUPABASE_URL = 'http://localhost:54321';

async function testLocalSupabase() {
  console.log('🚀 Local Supabase Basit Test\n');

  try {
    // 1. Test Supabase connection
    console.log('1. Supabase bağlantısı test ediliyor...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`);
    console.log(`✅ Supabase bağlantısı: ${response.status}\n`);

    // 2. Test Fuel Manager APIs (without auth for now)
    console.log('2. Fuel Manager API\'leri test ediliyor...');
    const appBaseUrl = 'http://localhost:3000';
    
    const apiTests = [
      { name: 'Fuel Quality List', url: `${appBaseUrl}/api/fuel-manager/fuel-quality/list` },
      { name: 'Fuel Types', url: `${appBaseUrl}/api/fuel-manager/fuel-inventory/fuel-types` },
      { name: 'Price Prediction Files', url: `${appBaseUrl}/api/fuel-manager/price-prediction` }
    ];

    for (const test of apiTests) {
      try {
        const response = await fetch(test.url);
        console.log(`✅ ${test.name}: ${response.status}`);
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          console.log(`⚠️  ${test.name}: Uygulama çalışmıyor`);
        } else {
          console.log(`❌ ${test.name}: ${error.message}`);
        }
      }
    }

    console.log('\n📋 Local Supabase Bilgileri:');
    console.log(`   URL: ${SUPABASE_URL}`);
    console.log(`   Studio: http://localhost:54323`);
    console.log('\n🔧 Sonraki Adımlar:');
    console.log('   1. Supabase Studio\'ya gidin: http://localhost:54323');
    console.log('   2. Settings > API sekmesinden key\'leri alın');
    console.log('   3. Authentication > Users\'dan test kullanıcısı oluşturun');
    console.log('   4. Postman\'de environment variables\'ları güncelleyin');

  } catch (error) {
    console.error('❌ Test hatası:', error.message);
  }
}

testLocalSupabase();
