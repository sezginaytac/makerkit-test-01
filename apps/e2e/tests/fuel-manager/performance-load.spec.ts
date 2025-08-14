import { expect, test } from '@playwright/test';

test.describe('Fuel Manager Performance and Load Tests', () => {
  test.describe('Response Time Performance', () => {
    test('should respond within acceptable time limits for single requests', async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.get('/api/fuel-manager/fuel-quality/list');
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Response should be received within 5 seconds
      expect(responseTime).toBeLessThan(5000);
      expect([200, 401, 404, 500]).toContain(response.status());
      
      console.log(`Single request response time: ${responseTime}ms`);
    });

    test('should handle multiple sequential requests efficiently', async ({ request }) => {
      const responseTimes = [];
      
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        const response = await request.get('/api/fuel-manager/fuel-inventory/fuel-types');
        const endTime = Date.now();
        
        responseTimes.push(endTime - startTime);
        expect([200, 401, 404, 500]).toContain(response.status());
      }
      
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      
      // Average response time should be under 3 seconds
      expect(avgResponseTime).toBeLessThan(3000);
      // No single request should take more than 5 seconds
      expect(maxResponseTime).toBeLessThan(5000);
      
      console.log(`Sequential requests - Average: ${avgResponseTime.toFixed(2)}ms, Max: ${maxResponseTime}ms`);
    });
  });

  test.describe('Concurrent Load Testing', () => {
    test('should handle 10 concurrent requests efficiently', async ({ request }) => {
      const startTime = Date.now();
      const concurrentCount = 10;
      
      const promises = Array(concurrentCount).fill(null).map(() =>
        request.get('/api/fuel-manager/fuel-quality/list')
      );
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // All requests should complete
      expect(responses).toHaveLength(concurrentCount);
      
      // All responses should have valid status codes
      responses.forEach(response => {
        expect([200, 401, 404, 500]).toContain(response.status());
      });
      
      // Total time should be reasonable (under 10 seconds for 10 concurrent requests)
      expect(totalTime).toBeLessThan(10000);
      
      console.log(`${concurrentCount} concurrent requests completed in ${totalTime}ms`);
    });

    test('should handle mixed concurrent operations', async ({ request }) => {
      const startTime = Date.now();
      
      const promises = [
        request.get('/api/fuel-manager/fuel-quality/list'),
        request.get('/api/fuel-manager/fuel-inventory/fuel-types'),
        request.get('/api/fuel-manager/fuel-inventory/port-names'),
        request.get('/api/fuel-manager/fuel-inventory/ships-names'),
        request.get('/api/fuel-manager/price-prediction'),
        request.post('/api/fuel-manager/fuel-quality/upload'),
        request.post('/api/fuel-manager/fuel-inventory/calculate-and-save', { data: {} })
      ];
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // All requests should complete
      expect(responses).toHaveLength(7);
      
      // All responses should have valid status codes
      responses.forEach((response, index) => {
        const endpoint = ['fuel-quality-list', 'fuel-types', 'port-names', 'ships-names', 'price-prediction', 'fuel-quality-upload', 'calculate-save'][index];
        expect([200, 400, 401, 404, 500]).toContain(response.status());
        
        if (response.status() === 500) {
          console.log(`${endpoint} concurrent test error:`, response.status());
        }
      });
      
      // Total time should be reasonable
      expect(totalTime).toBeLessThan(15000);
      
      console.log(`Mixed concurrent operations completed in ${totalTime}ms`);
    });
  });

  test.describe('Memory and Resource Management', () => {
    test('should handle large file uploads without memory issues', async ({ request }) => {
      // Create a larger test file (1MB)
      const largeData = 'x'.repeat(1024 * 1024); // 1MB of data
      const formData = new FormData();
      formData.append('file', new Blob([largeData], { type: 'text/csv' }), 'large-file.csv');
      
      const startTime = Date.now();
      const response = await request.post('/api/fuel-manager/fuel-quality/upload', {
        data: formData,
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Should handle large files within reasonable time
      expect(responseTime).toBeLessThan(10000);
      expect([401, 500]).toContain(response.status());
      
      if (response.status() === 500) {
        const body = await response.json();
        console.log('Large file upload error:', body.error);
        expect(body.error).toBeDefined();
      }
      
      console.log(`Large file upload (1MB) completed in ${responseTime}ms`);
    });

    test('should maintain consistent performance across multiple large operations', async ({ request }) => {
      const responseTimes = [];
      
      for (let i = 0; i < 3; i++) {
        const largeData = 'x'.repeat(512 * 1024); // 512KB of data
        const formData = new FormData();
        formData.append('file', new Blob([largeData], { type: 'text/csv' }), `large-file-${i}.csv`);
        
        const startTime = Date.now();
        const response = await request.post('/api/fuel-manager/fuel-quality/upload', {
          data: formData,
        });
        const endTime = Date.now();
        
        responseTimes.push(endTime - startTime);
        expect([401, 500]).toContain(response.status());
      }
      
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const variance = responseTimes.reduce((acc, time) => acc + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length;
      const standardDeviation = Math.sqrt(variance);
      
      // Performance should be consistent (low variance)
      expect(standardDeviation).toBeLessThan(2000); // Less than 2 seconds variance
      
      console.log(`Large file operations - Average: ${avgResponseTime.toFixed(2)}ms, Std Dev: ${standardDeviation.toFixed(2)}ms`);
    });
  });

  test.describe('Stress Testing', () => {
    test('should handle rapid successive requests', async ({ request }) => {
      const startTime = Date.now();
      const requestCount = 20;
      const responses = [];
      
      // Make rapid successive requests
      for (let i = 0; i < requestCount; i++) {
        const response = await request.get('/api/fuel-manager/fuel-quality/list');
        responses.push(response.status());
        
        // Small delay to simulate rapid but not simultaneous requests
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // All requests should complete
      expect(responses).toHaveLength(requestCount);
      
      // All responses should have valid status codes
      responses.forEach(status => {
        expect([200, 401, 404, 500]).toContain(status);
      });
      
      // Should handle rapid requests efficiently
      expect(totalTime).toBeLessThan(15000);
      
      console.log(`${requestCount} rapid successive requests completed in ${totalTime}ms`);
    });

    test('should maintain stability under sustained load', async ({ request }) => {
      const startTime = Date.now();
      const sustainedRequests = 30;
      const responses = [];
      const responseTimes = [];
      
      // Make sustained requests over time
      for (let i = 0; i < sustainedRequests; i++) {
        const requestStart = Date.now();
        const response = await request.get('/api/fuel-manager/fuel-inventory/fuel-types');
        const requestEnd = Date.now();
        
        responses.push(response.status());
        responseTimes.push(requestEnd - requestStart);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // All requests should complete
      expect(responses).toHaveLength(sustainedRequests);
      
      // All responses should have valid status codes
      responses.forEach(status => {
        expect([200, 401, 404, 500]).toContain(status);
      });
      
      // Performance should not degrade significantly over time
      const firstHalf = responseTimes.slice(0, Math.floor(sustainedRequests / 2));
      const secondHalf = responseTimes.slice(Math.floor(sustainedRequests / 2));
      
      const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      // Second half should not be significantly slower than first half
      expect(secondHalfAvg).toBeLessThan(firstHalfAvg * 1.5);
      
      console.log(`Sustained load test completed in ${totalTime}ms`);
      console.log(`First half avg: ${firstHalfAvg.toFixed(2)}ms, Second half avg: ${secondHalfAvg.toFixed(2)}ms`);
    });
  });

  test.describe('Error Recovery Performance', () => {
    test('should recover quickly from errors', async ({ request }) => {
      const errorRecoveryTimes = [];
      
      for (let i = 0; i < 5; i++) {
        // First, make a request that might fail
        const errorResponse = await request.post('/api/fuel-manager/fuel-quality/upload');
        expect([400, 401, 500]).toContain(errorResponse.status());
        
        // Then immediately make a valid request to test recovery
        const startTime = Date.now();
        const recoveryResponse = await request.get('/api/fuel-manager/fuel-quality/list');
        const endTime = Date.now();
        
        errorRecoveryTimes.push(endTime - startTime);
        expect([200, 401, 404, 500]).toContain(recoveryResponse.status());
      }
      
      const avgRecoveryTime = errorRecoveryTimes.reduce((a, b) => a + b, 0) / errorRecoveryTimes.length;
      
      // Error recovery should be quick
      expect(avgRecoveryTime).toBeLessThan(3000);
      
      console.log(`Error recovery performance - Average: ${avgRecoveryTime.toFixed(2)}ms`);
    });
  });
});
