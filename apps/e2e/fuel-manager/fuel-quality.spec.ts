import { expect, test } from '@playwright/test';

test.describe('Fuel Quality API', () => {
  test.describe('GET /api/fuel-manager/fuel-quality/list', () => {
    test('should return 401 for unauthenticated requests', async ({ request }) => {
      const response = await request.get('/api/fuel-manager/fuel-quality/list');
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body).toEqual(expect.objectContaining({
        error: 'Unauthorized'
      }));
    });
  });

  test.describe('POST /api/fuel-manager/fuel-quality/upload', () => {
    test('should return 401 for unauthenticated requests', async ({ request }) => {
      const formData = new FormData();
      formData.append('file', new Blob(['test data'], { type: 'text/csv' }), 'test.csv');
      
      const response = await request.post('/api/fuel-manager/fuel-quality/upload', {
        data: formData,
      });
      
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body).toEqual(expect.objectContaining({
        error: 'Unauthorized'
      }));
    });
  });

  test.describe('PUT /api/fuel-manager/fuel-quality/update', () => {
    test('should return 401 for unauthenticated requests', async ({ request }) => {
      const response = await request.put('/api/fuel-manager/fuel-quality/update', {
        data: {
          id: 'test-id',
          data: { quality: 'good' }
        }
      });
      
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body).toEqual(expect.objectContaining({
        error: 'Unauthorized'
      }));
    });
  });

  test.describe('DELETE /api/fuel-manager/fuel-quality/delete', () => {
    test('should return 401 for unauthenticated requests', async ({ request }) => {
      const response = await request.delete('/api/fuel-manager/fuel-quality/delete', {
        data: { id: 'test-id' }
      });
      
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body).toEqual(expect.objectContaining({
        error: 'Unauthorized'
      }));
    });
  });
});
