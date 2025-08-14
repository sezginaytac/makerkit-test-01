import { expect, test } from '@playwright/test';

test.describe('Price Prediction API', () => {
  test.describe('GET /api/fuel-manager/price-prediction', () => {
    test('should return 401 for unauthenticated requests', async ({ request }) => {
      const response = await request.get('/api/fuel-manager/price-prediction');
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body).toEqual(expect.objectContaining({
        error: 'Unauthorized'
      }));
    });
  });

  test.describe('POST /api/fuel-manager/price-prediction', () => {
    test('should return 401 for unauthenticated requests', async ({ request }) => {
      const formData = new FormData();
      formData.append('file', new Blob(['test data'], { type: 'text/csv' }), 'test.csv');
      
      const response = await request.post('/api/fuel-manager/price-prediction', {
        data: formData,
      });
      
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body).toEqual(expect.objectContaining({
        error: 'Unauthorized'
      }));
    });
  });

  test.describe('GET /api/fuel-manager/price-prediction/active', () => {
    test('should return 401 for unauthenticated requests', async ({ request }) => {
      const response = await request.get('/api/fuel-manager/price-prediction/active');
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body).toEqual(expect.objectContaining({
        error: 'Unauthorized'
      }));
    });
  });

  test.describe('GET /api/fuel-manager/price-prediction/[id]/use', () => {
    test('should return 401 for unauthenticated requests', async ({ request }) => {
      const response = await request.get('/api/fuel-manager/price-prediction/test-id/use');
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body).toEqual(expect.objectContaining({
        error: 'Unauthorized'
      }));
    });
  });

  test.describe('POST /api/fuel-manager/price-prediction/[id]/process', () => {
    test('should return 401 for unauthenticated requests', async ({ request }) => {
      const response = await request.post('/api/fuel-manager/price-prediction/test-id/process');
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body).toEqual(expect.objectContaining({
        error: 'Unauthorized'
      }));
    });
  });

  test.describe('DELETE /api/fuel-manager/price-prediction/[id]/delete', () => {
    test('should return 401 for unauthenticated requests', async ({ request }) => {
      const response = await request.delete('/api/fuel-manager/price-prediction/test-id/delete');
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body).toEqual(expect.objectContaining({
        error: 'Unauthorized'
      }));
    });
  });
});
