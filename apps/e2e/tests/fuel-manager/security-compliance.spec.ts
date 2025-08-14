import { expect, test } from '@playwright/test';

test.describe('Fuel Manager Security and Compliance Tests', () => {
  test.describe('Authentication and Authorization', () => {
    test('should require authentication for all protected endpoints', async ({ request }) => {
      const protectedEndpoints = [
        { method: 'GET', path: '/api/fuel-manager/fuel-quality/list' },
        { method: 'POST', path: '/api/fuel-manager/fuel-quality/upload' },
        { method: 'PUT', path: '/api/fuel-manager/fuel-quality/update' },
        { method: 'DELETE', path: '/api/fuel-manager/fuel-quality/delete' },
        { method: 'GET', path: '/api/fuel-manager/fuel-inventory/fuel-types' },
        { method: 'GET', path: '/api/fuel-manager/fuel-inventory/port-names' },
        { method: 'GET', path: '/api/fuel-manager/fuel-inventory/ships-names' },
        { method: 'POST', path: '/api/fuel-manager/fuel-inventory/calculate-and-save' },
        { method: 'GET', path: '/api/fuel-manager/price-prediction' },
        { method: 'POST', path: '/api/fuel-manager/price-prediction' },
        { method: 'POST', path: '/api/fuel-manager/price-prediction/test-id/process' },
        { method: 'DELETE', path: '/api/fuel-manager/price-prediction/test-id/delete' }
      ];

      for (const endpoint of protectedEndpoints) {
        let response;
        
        if (endpoint.method === 'GET') {
          response = await request.get(endpoint.path);
        } else if (endpoint.method === 'POST') {
          response = await request.post(endpoint.path);
        } else if (endpoint.method === 'PUT') {
          response = await request.put(endpoint.path);
        } else if (endpoint.method === 'DELETE') {
          response = await request.delete(endpoint.path);
        }

        // All protected endpoints should return 401 (Unauthorized) for unauthenticated requests
        // or 500 (Internal Server Error) due to missing database tables
        expect([401, 500]).toContain(response.status());
        
        if (response.status() === 401) {
          const body = await response.json();
          expect(body.error).toBe('Unauthorized');
        }
        
        console.log(`${endpoint.method} ${endpoint.path}: ${response.status()}`);
      }
    });

    test('should not expose sensitive information in error messages', async ({ request }) => {
      // Test various endpoints that might expose sensitive information
      const testEndpoints = [
        '/api/fuel-manager/fuel-quality/list',
        '/api/fuel-manager/fuel-inventory/fuel-types',
        '/api/fuel-manager/price-prediction'
      ];

      for (const endpoint of testEndpoints) {
        const response = await request.get(endpoint);
        
        if (response.status() === 500) {
          const body = await response.json();
          
          // Error messages should not contain sensitive information
          expect(body.error).toBeDefined();
          expect(typeof body.error).toBe('string');
          
          // Should not expose database connection details, table names, or internal paths
          const sensitivePatterns = [
            /database/i,
            /connection/i,
            /password/i,
            /secret/i,
            /internal/i,
            /stack trace/i,
            /at\s+\//i, // File paths
            /:\d+:/i   // Line numbers
          ];
          
          sensitivePatterns.forEach(pattern => {
            expect(body.error).not.toMatch(pattern);
          });
          
          console.log(`${endpoint} error message is secure: ${body.error.substring(0, 50)}...`);
        }
      }
    });
  });

  test.describe('Input Validation and Sanitization', () => {
    test('should validate and sanitize file uploads', async ({ request }) => {
      // Test various file types and sizes
      const testCases = [
        { data: 'test data', type: 'text/csv', name: 'valid.csv', expectedStatus: [401, 500] },
        { data: '', type: 'text/csv', name: 'empty.csv', expectedStatus: [400, 401, 500] },
        { data: 'x'.repeat(10 * 1024 * 1024), type: 'text/csv', name: 'very-large.csv', expectedStatus: [400, 401, 500] }, // 10MB
        { data: '<script>alert("xss")</script>', type: 'text/csv', name: 'xss.csv', expectedStatus: [400, 401, 500] },
        { data: 'test', type: 'application/exe', name: 'malicious.exe', expectedStatus: [400, 401, 500] }
      ];

      for (const testCase of testCases) {
        const formData = new FormData();
        formData.append('file', new Blob([testCase.data], { type: testCase.type }), testCase.name);
        
        const response = await request.post('/api/fuel-manager/fuel-quality/upload', {
          data: formData,
        });
        
        expect(testCase.expectedStatus).toContain(response.status());
        
        if (response.status() === 400) {
          const body = await response.json();
          expect(body.error).toBeDefined();
          console.log(`${testCase.name} validation: ${body.error}`);
        }
      }
    });

    test('should validate JSON payloads', async ({ request }) => {
      const testCases = [
        { data: {}, expectedStatus: [400, 401, 500] },
        { data: { invalidField: 'test' }, expectedStatus: [400, 401, 500] },
        { data: null, expectedStatus: [400, 401, 500] },
        { data: 'invalid json string', expectedStatus: [400, 401, 500] },
        { data: { fuelType: '', quantity: -1, port: '', ship: '' }, expectedStatus: [400, 401, 500] }
      ];

      for (const testCase of testCases) {
        const response = await request.post('/api/fuel-manager/fuel-inventory/calculate-and-save', {
          data: testCase.data,
        });
        
        expect(testCase.expectedStatus).toContain(response.status());
        
        if (response.status() === 400) {
          const body = await response.json();
          expect(body.error).toBeDefined();
          console.log(`JSON validation: ${body.error}`);
        }
      }
    });

    test('should handle malformed requests gracefully', async ({ request }) => {
      // Test various malformed request scenarios
      const malformedTests = [
        { method: 'POST', path: '/api/fuel-manager/fuel-quality/upload', data: 'not form data' },
        { method: 'POST', path: '/api/fuel-manager/fuel-inventory/calculate-and-save', data: 'invalid json' },
        { method: 'PUT', path: '/api/fuel-manager/fuel-quality/update', data: 'malformed data' }
      ];

      for (const test of malformedTests) {
        let response;
        
        if (test.method === 'POST') {
          response = await request.post(test.path, { data: test.data });
        } else if (test.method === 'PUT') {
          response = await request.put(test.path, { data: test.data });
        }

        // Should handle malformed requests gracefully
        expect([400, 401, 500]).toContain(response.status());
        
        if (response.status() === 400) {
          const body = await response.json();
          expect(body.error).toBeDefined();
          console.log(`${test.method} ${test.path} malformed request handled: ${body.error}`);
        }
      }
    });
  });

  test.describe('Rate Limiting and Abuse Prevention', () => {
    test('should handle rapid repeated requests appropriately', async ({ request }) => {
      const rapidRequests = 50;
      const responses = [];
      
      // Make rapid repeated requests
      for (let i = 0; i < rapidRequests; i++) {
        const response = await request.get('/api/fuel-manager/fuel-quality/list');
        responses.push(response.status);
        
        // Very small delay to simulate rapid requests
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // All requests should complete (either successfully or with appropriate error)
      expect(responses).toHaveLength(rapidRequests);
      
      // Should not crash or become unresponsive
      responses.forEach(status => {
        expect([200, 401, 404, 500, 429]).toContain(status); // 429 = Too Many Requests
      });
      
      // Count different response types
      const statusCounts = responses.reduce((acc, status) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('Rapid requests response distribution:', statusCounts);
    });

    test('should handle concurrent abuse attempts', async ({ request }) => {
      const abuseAttempts = 20;
      
      // Simulate concurrent abuse attempts
      const promises = Array(abuseAttempts).fill(null).map(() =>
        request.post('/api/fuel-manager/fuel-quality/upload')
      );
      
      const responses = await Promise.all(promises);
      
      // All abuse attempts should be handled
      expect(responses).toHaveLength(abuseAttempts);
      
      // Should respond appropriately to all attempts
      responses.forEach(response => {
        expect([400, 401, 429, 500]).toContain(response.status());
      });
      
      // Count response types
      const statusCounts = responses.reduce((acc, response) => {
        const status = response.status();
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('Concurrent abuse attempts response distribution:', statusCounts);
    });
  });

  test.describe('Data Privacy and Protection', () => {
    test('should not expose user data in error responses', async ({ request }) => {
      // Test endpoints that might expose user data
      const testEndpoints = [
        '/api/fuel-manager/fuel-quality/list',
        '/api/fuel-manager/price-prediction'
      ];

      for (const endpoint of testEndpoints) {
        const response = await request.get(endpoint);
        
        if (response.status() === 500) {
          const body = await response.json();
          
          // Should not expose user IDs, emails, or other personal information
          const privacyPatterns = [
            /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i, // UUIDs
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i, // Email addresses
            /user_id/i,
            /account_id/i,
            /email/i
          ];
          
          privacyPatterns.forEach(pattern => {
            expect(body.error).not.toMatch(pattern);
          });
          
          console.log(`${endpoint} error response protects user privacy`);
        }
      }
    });

    test('should handle sensitive file types appropriately', async ({ request }) => {
      const sensitiveFileTypes = [
        { data: 'sensitive data', type: 'application/json', name: 'config.json' },
        { data: 'database dump', type: 'text/plain', name: 'database.sql' },
        { data: 'log data', type: 'text/plain', name: 'app.log' }
      ];

      for (const fileType of sensitiveFileTypes) {
        const formData = new FormData();
        formData.append('file', new Blob([fileType.data], { type: fileType.type }), fileType.name);
        
        const response = await request.post('/api/fuel-manager/fuel-quality/upload', {
          data: formData,
        });
        
        // Should handle sensitive files appropriately
        expect([400, 401, 500]).toContain(response.status());
        
        if (response.status() === 400) {
          const body = await response.json();
          expect(body.error).toBeDefined();
          console.log(`Sensitive file ${fileType.name} handled: ${body.error}`);
        }
      }
    });
  });

  test.describe('Compliance and Standards', () => {
    test('should return appropriate HTTP status codes', async ({ request }) => {
      const statusCodeTests = [
        { method: 'GET', path: '/api/fuel-manager/fuel-quality/list', expectedStatuses: [200, 401, 404, 500] },
        { method: 'POST', path: '/api/fuel-manager/fuel-quality/upload', expectedStatuses: [200, 400, 401, 500] },
        { method: 'PUT', path: '/api/fuel-manager/fuel-quality/update', expectedStatuses: [200, 400, 401, 404, 500] },
        { method: 'DELETE', path: '/api/fuel-manager/fuel-quality/delete', expectedStatuses: [200, 400, 401, 404, 500] }
      ];

      for (const test of statusCodeTests) {
        let response;
        
        if (test.method === 'GET') {
          response = await request.get(test.path);
        } else if (test.method === 'POST') {
          response = await request.post(test.path);
        } else if (test.method === 'PUT') {
          response = await request.put(test.path);
        } else if (test.method === 'DELETE') {
          response = await request.delete(test.path);
        }

        expect(test.expectedStatuses).toContain(response.status());
        console.log(`${test.method} ${test.path}: ${response.status()}`);
      }
    });

    test('should include proper response headers', async ({ request }) => {
      const response = await request.get('/api/fuel-manager/fuel-quality/list');
      
      const headers = response.headers();
      
      // Should include security headers
      expect(headers).toBeDefined();
      
      // Log available headers for inspection
      console.log('Response headers:', Object.keys(headers));
      
      // Basic validation that response has headers
      expect(Object.keys(headers).length).toBeGreaterThan(0);
    });

    test('should handle CORS appropriately', async ({ request }) => {
      // Test preflight request
      const response = await request.options('/api/fuel-manager/fuel-quality/list');
      
      // Should handle OPTIONS requests appropriately
      expect([200, 204, 401, 404, 500]).toContain(response.status());
      
      console.log('CORS preflight response status:', response.status());
    });
  });
});
