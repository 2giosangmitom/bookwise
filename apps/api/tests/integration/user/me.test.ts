import { build, users } from '../helpers/build';
import { getAccessToken } from '../helpers/auth';

describe('GET /api/user/me', async () => {
  const app = await build();

  afterAll(async () => {
    await app.close();
  });

  it('should reject request without authentication token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/user/me'
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "code": "FST_JWT_NO_AUTHORIZATION_IN_COOKIE",
        "error": "Unauthorized",
        "message": "No Authorization was found in request.cookies",
        "statusCode": 401,
      }
    `);
  });

  it('should reject request with invalid token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/user/me',
      headers: {
        authorization: 'Bearer invalid-token-here'
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      statusCode: 401,
      error: 'Unauthorized'
    });
  });

  it('should return current user profile with valid token', async () => {
    const accessToken = await getAccessToken(app, users[0]);

    const response = await app.inject({
      method: 'GET',
      url: '/api/user/me',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveProperty('message', 'User profile retrieved successfully');
    expect(body).toHaveProperty('data');
    expect(body.data).toMatchObject({
      user_id: expect.any(String),
      name: users[0].fullName,
      email: users[0].email,
      role: expect.stringMatching(/^(ADMIN|LIBRARIAN|MEMBER)$/),
      created_at: expect.any(String),
      updated_at: expect.any(String)
    });
  });

  it('should return user profile with correct data types', async () => {
    const accessToken = await getAccessToken(app, users[1]);

    const response = await app.inject({
      method: 'GET',
      url: '/api/user/me',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();

    // Validate UUID format
    expect(body.data.user_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

    // Validate email format
    expect(body.data.email).toContain('@');

    // Validate ISO date format
    expect(() => new Date(body.data.created_at)).not.toThrow();
    expect(() => new Date(body.data.updated_at)).not.toThrow();
  });

  it('should not expose sensitive fields', async () => {
    const accessToken = await getAccessToken(app, users[2]);

    const response = await app.inject({
      method: 'GET',
      url: '/api/user/me',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();

    // Ensure sensitive fields are not exposed
    expect(body.data).not.toHaveProperty('password_hash');
    expect(body.data).not.toHaveProperty('salt');
    expect(body.data).not.toHaveProperty('password');
  });

  it('should work for users with different roles', async () => {
    // Test with multiple users that might have different roles
    for (let i = 0; i < 3; i++) {
      const accessToken = await getAccessToken(app, users[i]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/user/me',
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.email).toBe(users[i].email);
      expect(body.data.name).toBe(users[i].fullName);
    }
  });
});
