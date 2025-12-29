import { authHook } from '@/hooks/auth';
import { users } from '../helpers/build';
import { build } from '../helpers/build';

describe('POST /api/auth/signout', async () => {
  const app = await build();

  beforeAll(() => {
    app.get('/test/protected-route', { preHandler: authHook }, async () => {
      return { message: 'Access granted to protected route' };
    });
  });

  it('should sign out successfully with valid refresh token', async () => {
    const user = users[0];

    // Sign in to get tokens
    const signInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: user.email,
        password: user.password
      }
    });

    const refreshToken = signInResponse.cookies.find((cookie) => cookie.name === 'refreshToken');
    assert.ok(refreshToken);

    // Sign out using the refresh token
    const signOutResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signout',
      cookies: {
        refreshToken: refreshToken.value
      }
    });

    expect(signOutResponse.statusCode).toBe(200);
    expect(signOutResponse.json()).toMatchInlineSnapshot(`
      {
        "message": "User signed out successfully",
      }
    `);
  });

  it('should fail to sign out with missing refresh token', async () => {
    const signOutResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signout'
    });

    expect(signOutResponse.statusCode).toBe(401);
    expect(signOutResponse.json()).toMatchInlineSnapshot(`
      {
        "error": "Unauthorized",
        "message": "No Authorization was found in request.cookies",
        "statusCode": 401,
      }
    `);
  });

  it("can't use the refresh token after sign out", async () => {
    const user = users[1];

    // Sign in to get tokens
    const signInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: user.email,
        password: user.password
      }
    });

    const refreshToken = signInResponse.cookies.find((cookie) => cookie.name === 'refreshToken');
    assert.ok(refreshToken);

    // Sign out using the refresh token
    const signOutResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signout',
      cookies: {
        refreshToken: refreshToken.value
      }
    });

    expect(signOutResponse.statusCode).toBe(200);

    // Attempt to refresh token after sign out
    const refreshTokenResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh-token',
      cookies: {
        refreshToken: refreshToken.value
      }
    });

    expect(refreshTokenResponse.statusCode).toBe(401);
    expect(refreshTokenResponse.json()).toMatchInlineSnapshot(`
      {
        "error": "Unauthorized",
        "message": "Untrusted authorization token",
        "statusCode": 401,
      }
    `);
  });

  it("can't use the access token associated with the refresh token after sign out but other tokens can", async () => {
    const user = users[2];

    // Sign in to get tokens
    const signInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: user.email,
        password: user.password
      }
    });

    const refreshToken = signInResponse.cookies.find((cookie) => cookie.name === 'refreshToken');
    assert.ok(refreshToken);

    const accessToken = signInResponse.json().data.access_token;
    assert.ok(accessToken);

    // Other sign in the get another access token
    const otherSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: user.email,
        password: user.password
      }
    });

    const otherAccessToken = otherSignInResponse.json().data.access_token;
    assert.ok(otherAccessToken);

    // Sign out using the refresh token
    const signOutResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signout',
      cookies: {
        refreshToken: refreshToken.value
      }
    });

    expect(signOutResponse.statusCode).toBe(200);

    // Attempt to access a protected route using the access token after sign out
    const protectedResponse = await app.inject({
      method: 'GET',
      url: '/test/protected-route',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    expect(protectedResponse.statusCode).toBe(401);
    expect(protectedResponse.json()).toMatchInlineSnapshot(`
      {
        "code": "FST_JWT_AUTHORIZATION_TOKEN_UNTRUSTED",
        "error": "Unauthorized",
        "message": "Untrusted authorization token",
        "statusCode": 401,
      }
    `);

    // Attempt to access a protected route using the other access token after sign out
    const otherProtectedResponse = await app.inject({
      method: 'GET',
      url: '/test/protected-route',
      headers: {
        Authorization: `Bearer ${otherAccessToken}`
      }
    });

    expect(otherProtectedResponse.statusCode).toBe(200);
    expect(otherProtectedResponse.json()).toMatchInlineSnapshot(`
      {
        "message": "Access granted to protected route",
      }
    `);
  });
});
