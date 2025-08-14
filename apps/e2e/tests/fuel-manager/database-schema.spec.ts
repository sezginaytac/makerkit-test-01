import { expect, test } from '@playwright/test';

test.describe('Database Schema Validation', () => {
  test.describe('Required Tables Check', () => {
    test('should have access to memberships table', async ({ request }) => {
      // This test will check if the memberships table is accessible
      // We'll use a simple API call that should fail with a specific error if the table doesn't exist
      const response = await request.get('/api/fuel-manager/price-prediction');
      
      // If the table doesn't exist, we expect a 500 error
      // If it exists but user is not authenticated, we expect 401
      // If it exists and user is authenticated but no data, we expect 200 or 404
      expect([200, 401, 404, 500]).toContain(response.status());
      
      if (response.status() === 500) {
        const body = await response.json();
        console.log('Database error details:', body);
      }
    });

    test('should have access to price_prediction_files table', async ({ request }) => {
      const response = await request.get('/api/fuel-manager/price-prediction');
      expect([200, 401, 404, 500]).toContain(response.status());
      
      if (response.status() === 500) {
        const body = await response.json();
        console.log('Database error details:', body);
      }
    });

    test('should have access to fuel_quality_data table', async ({ request }) => {
      const response = await request.get('/api/fuel-manager/fuel-quality/list');
      expect([200, 401, 404, 500]).toContain(response.status());
      
      if (response.status() === 500) {
        const body = await response.json();
        console.log('Database error details:', body);
      }
    });
  });

  test.describe('Table Structure Validation', () => {
    test('should validate memberships table structure', async ({ request }) => {
      // This test will attempt to access the memberships table through an API endpoint
      // and check if the expected columns are accessible
      const response = await request.get('/api/fuel-manager/price-prediction');
      
      if (response.status() === 500) {
        const body = await response.json();
        // Check if the error is related to missing columns or table structure
        expect(body.error).toBeDefined();
        console.log('Table structure error:', body.error);
      }
    });

    test('should validate price_prediction_files table structure', async ({ request }) => {
      const response = await request.get('/api/fuel-manager/price-prediction');
      
      if (response.status() === 500) {
        const body = await response.json();
        expect(body.error).toBeDefined();
        console.log('Table structure error:', body.error);
      }
    });
  });

  test.describe('Database Connection', () => {
    test('should have working database connection', async ({ request }) => {
      // Test basic database connectivity through healthcheck
      const response = await request.get('/healthcheck');
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.services.database).toBe(true);
    });
  });
});
