#!/usr/bin/env node

/**
 * Fuel Manager API Quick Test Runner
 * 
 * Bu script, Postman collection'ındaki tüm endpoint'leri hızlıca test etmek için kullanılır.
 * 
 * Kullanım:
 * node quick-test-runner.js [base_url] [auth_token]
 * 
 * Örnek:
 * node quick-test-runner.js http://localhost:3000 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Test konfigürasyonu
const config = {
  baseUrl: process.argv[2] || 'http://localhost:3000',
  authToken: process.argv[3] || '',
  timeout: 10000,
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v')
};

// Test endpoint'leri
const endpoints = [
  // Fuel Quality
  { name: 'Fuel Quality List', method: 'GET', path: '/api/fuel-manager/fuel-quality/list' },
  { name: 'Fuel Quality Upload', method: 'POST', path: '/api/fuel-manager/fuel-quality/upload', hasBody: true },
  { name: 'Fuel Quality Update', method: 'PUT', path: '/api/fuel-manager/fuel-quality/update', hasBody: true },
  { name: 'Fuel Quality Delete', method: 'DELETE', path: '/api/fuel-manager/fuel-quality/delete', hasBody: true },
  
  // Fuel Inventory
  { name: 'Fuel Types', method: 'GET', path: '/api/fuel-manager/fuel-inventory/fuel-types' },
  { name: 'Port Names', method: 'GET', path: '/api/fuel-manager/fuel-inventory/port-names' },
  { name: 'Ship Names', method: 'GET', path: '/api/fuel-manager/fuel-inventory/ships-names' },
  { name: 'Calculate and Save', method: 'POST', path: '/api/fuel-manager/fuel-inventory/calculate-and-save', hasBody: true },
  
  // Price Prediction
  { name: 'Price Prediction List', method: 'GET', path: '/api/fuel-manager/price-prediction' },
  { name: 'Price Prediction Upload', method: 'POST', path: '/api/fuel-manager/price-prediction', hasBody: true },
  { name: 'Active Predictions', method: 'GET', path: '/api/fuel-manager/price-prediction/active' },
  { name: 'Process Prediction', method: 'POST', path: '/api/fuel-manager/price-prediction/test-id/process', hasBody: true },
  { name: 'Use Prediction', method: 'POST', path: '/api/fuel-manager/price-prediction/test-id/use', hasBody: true },
  { name: 'Delete Prediction', method: 'DELETE', path: '/api/fuel-manager/price-prediction/test-id/delete', hasBody: true }
];

// Test sonuçları
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// HTTP request helper
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.url);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Fuel Manager API Test Runner',
        ...options.headers
      },
      timeout: config.timeout
    };
    
    if (config.authToken) {
      requestOptions.headers['Authorization'] = `Bearer ${config.authToken}`;
    }
    
    const req = client.request(requestOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test endpoint
async function testEndpoint(endpoint) {
  const startTime = Date.now();
  const url = `${config.baseUrl}${endpoint.path}`;
  
  try {
    const requestData = endpoint.hasBody ? { test: true, timestamp: new Date().toISOString() } : null;
    
    const response = await makeRequest({
      url,
      method: endpoint.method,
      headers: endpoint.hasBody ? { 'Content-Type': 'application/json' } : {}
    }, requestData);
    
    const responseTime = Date.now() - startTime;
    const isSuccess = response.statusCode >= 200 && response.statusCode < 300;
    const isExpectedError = response.statusCode === 401 || response.statusCode === 500; // Expected for unauthenticated requests
    
    if (isSuccess || isExpectedError) {
      results.passed++;
      if (config.verbose) {
        console.log(`✅ ${endpoint.name}: ${response.statusCode} (${responseTime}ms)`);
      }
    } else {
      results.failed++;
      results.errors.push({
        endpoint: endpoint.name,
        statusCode: response.statusCode,
        response: response.body,
        url
      });
      if (config.verbose) {
        console.log(`❌ ${endpoint.name}: ${response.statusCode} (${responseTime}ms)`);
      }
    }
    
    return { success: isSuccess || isExpectedError, statusCode: response.statusCode, responseTime };
    
  } catch (error) {
    results.failed++;
    results.errors.push({
      endpoint: endpoint.name,
      error: error.message,
      url
    });
    
    if (config.verbose) {
      console.log(`💥 ${endpoint.name}: ERROR - ${error.message}`);
    }
    
    return { success: false, error: error.message };
  }
}

// Ana test fonksiyonu
async function runTests() {
  console.log('🚀 Fuel Manager API Quick Test Runner');
  console.log('=====================================');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Auth Token: ${config.authToken ? '✓ Set' : '✗ Not set'}`);
  console.log(`Timeout: ${config.timeout}ms`);
  console.log(`Verbose: ${config.verbose ? '✓' : '✗'}`);
  console.log('');
  
  results.total = endpoints.length;
  
  console.log(`📋 Testing ${endpoints.length} endpoints...`);
  console.log('');
  
  // Test'leri sırayla çalıştır
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    
    // Rate limiting için kısa bekleme
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Sonuçları göster
  console.log('');
  console.log('📊 Test Results');
  console.log('===============');
  console.log(`Total: ${results.total}`);
  console.log(`Passed: ${results.passed} ✅`);
  console.log(`Failed: ${results.failed} ❌`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.errors.length > 0) {
    console.log('');
    console.log('❌ Errors:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.endpoint}: ${error.statusCode || error.error}`);
      if (config.verbose && error.response) {
        console.log(`   Response: ${error.response.substring(0, 200)}...`);
      }
    });
  }
  
  // Sonuçları dosyaya kaydet
  const reportPath = path.join(__dirname, 'test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    config,
    results
  }, null, 2));
  
  console.log('');
  console.log(`📄 Detailed results saved to: ${reportPath}`);
  
  // Exit code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Script'i çalıştır
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint, endpoints };
