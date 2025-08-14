import { expect, test } from '@playwright/test';

test.describe('Fuel Inventory API', () => {
  test.describe('GET /api/fuel-manager/fuel-inventory/fuel-types', () => {
    test('should return 401 for unauthenticated requests', async ({ request }) => {
      const response = await request.get('/api/fuel-manager/fuel-inventory/fuel-types');
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body).toEqual(expect.objectContaining({
        error: 'Unauthorized'
      }));
    });
  });

  test.describe('GET /api/fuel-manager/fuel-inventory/port-names', () => {
    test('should return 401 for unauthenticated requests', async ({ request }) => {
      const response = await request.get('/api/fuel-manager/fuel-inventory/port-names');
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body).toEqual(expect.objectContaining({
        error: 'Unauthorized'
      }));
    });
  });

  test.describe('GET /api/fuel-manager/fuel-inventory/ships-names', () => {
    test('should return 401 for unauthenticated requests', async ({ request }) => {
      const response = await request.get('/api/fuel-manager/fuel-inventory/ships-names');
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body).toEqual(expect.objectContaining({
        error: 'Unauthorized'
      }));
    });
  });

  test.describe('POST /api/fuel-manager/fuel-inventory/calculate-and-save', () => {
    test('should return 401 for unauthenticated requests', async ({ request }) => {
      const response = await request.post('/api/fuel-manager/fuel-inventory/calculate-and-save', {
        data: {
          fuelType: 'diesel',
          quantity: 1000,
          port: 'Rotterdam',
          ship: 'Test Ship'
        }
      });
      
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body).toEqual(expect.objectContaining({
        error: 'Unauthorized'
      }));
    });
  });
});
