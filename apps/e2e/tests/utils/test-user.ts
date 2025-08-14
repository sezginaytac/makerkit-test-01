import { APIRequestContext } from '@playwright/test';

export interface TestUser {
  id: string;
  email: string;
  password: string;
}

export async function createTestUser(request: APIRequestContext): Promise<TestUser> {
  const email = `test-${Date.now()}@example.com`;
  const password = 'testpassword123';

  // Create a test user account
  const response = await request.post('/auth/sign-up', {
    data: {
      email,
      password,
      firstName: 'Test',
      lastName: 'User',
    },
  });

  if (response.status() !== 200) {
    throw new Error(`Failed to create test user: ${response.status()}`);
  }

  // For now, return a mock user since we can't easily get the actual user ID
  // In a real scenario, you might need to sign in and get the user ID from the response
  return {
    id: `mock-user-${Date.now()}`,
    email,
    password,
  };
}

export async function deleteTestUser(request: APIRequestContext, userId: string): Promise<void> {
  // In a real scenario, you might want to delete the test user
  // For now, we'll just log that we would delete the user
  console.log(`Would delete test user: ${userId}`);
  
  // You could implement actual user deletion here if needed
  // const response = await request.delete(`/api/users/${userId}`);
  // if (response.status() !== 200) {
  //   console.warn(`Failed to delete test user: ${response.status()}`);
  // }
}
