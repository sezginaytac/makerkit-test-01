// Local Supabase configuration
const SUPABASE_URL = 'http://localhost:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Test configuration
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

// Helper function for making requests
async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    error.response = response;
    throw error;
  }
  
  return response.json();
}

async function testLocalSupabase() {
  console.log('🚀 Local Supabase Test Başlatılıyor...\n');

  try {
    // 1. Test Supabase connection
    console.log('1. Supabase bağlantısı test ediliyor...');
    const healthResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/`, {
      headers: { 'apikey': SUPABASE_ANON_KEY }
    });
    console.log('✅ Supabase bağlantısı başarılı\n');

    // 2. Create test user
    console.log('2. Test kullanıcısı oluşturuluyor...');
    try {
      const createUserResponse = await makeRequest(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_SERVICE_KEY },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          email_confirm: true
        })
      });
      console.log('✅ Test kullanıcısı oluşturuldu:', createUserResponse.user.id);
    } catch (error) {
      if (error.response?.status === 422) {
        console.log('ℹ️  Kullanıcı zaten mevcut');
      } else {
        console.log('❌ Kullanıcı oluşturma hatası:', error.message);
      }
    }
    console.log('');

    // 3. Sign in
    console.log('3. Kullanıcı girişi yapılıyor...');
    const signInResponse = await makeRequest(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });
    
    const { access_token, user } = signInResponse;
    console.log('✅ Giriş başarılı');
    console.log('   User ID:', user.id);
    console.log('   Access Token:', access_token.substring(0, 50) + '...');
    console.log('');

    // 4. Get current user
    console.log('4. Kullanıcı bilgileri alınıyor...');
    const userResponse = await makeRequest(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    console.log('✅ Kullanıcı bilgileri alındı:', userResponse.email);
    console.log('');

    // 5. Test Fuel Manager APIs
    console.log('5. Fuel Manager API\'leri test ediliyor...');
    const appBaseUrl = 'http://localhost:3000';
    
    const apiTests = [
      { name: 'Fuel Quality List', url: `${appBaseUrl}/api/fuel-manager/fuel-quality/list` },
      { name: 'Fuel Types', url: `${appBaseUrl}/api/fuel-manager/fuel-inventory/fuel-types` },
      { name: 'Price Prediction Files', url: `${appBaseUrl}/api/fuel-manager/price-prediction` }
    ];

    for (const test of apiTests) {
      try {
        const response = await fetch(test.url, {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });
        console.log(`✅ ${test.name}: ${response.status}`);
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          console.log(`⚠️  ${test.name}: Uygulama çalışmıyor (${error.code})`);
        } else {
          console.log(`❌ ${test.name}: ${error.message}`);
        }
      }
    }

    console.log('\n🎉 Local Supabase test tamamlandı!');
    console.log('\n📋 Postman için kullanılacak bilgiler:');
    console.log(`   Supabase URL: ${SUPABASE_URL}`);
    console.log(`   Anon Key: ${SUPABASE_ANON_KEY}`);
    console.log(`   Service Key: ${SUPABASE_SERVICE_KEY}`);
    console.log(`   Test Email: ${TEST_EMAIL}`);
    console.log(`   Test Password: ${TEST_PASSWORD}`);
    console.log(`   Access Token: ${access_token}`);

  } catch (error) {
    console.error('❌ Test hatası:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the test
testLocalSupabase();
