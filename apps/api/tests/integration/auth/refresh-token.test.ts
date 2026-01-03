import { JWTUtils } from '@/utils/jwt';
import { users, build } from '../helpers/build';

describe('POST /api/auth/refresh-token', async () => {
  const app = await build();
  const jwtUtils = new JWTUtils(app.redis);

  afterAll(async () => {
    await app.close();
  });

  it('should reject if not provide refreshToken in cookies', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh-token'
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "error": "Unauthorized",
        "message": "No Authorization was found in request.cookies",
        "statusCode": 401,
      }
    `);
  });

  it('should refresh access token successfully', async () => {
    const user = users[0];
    const signInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: user.email,
        password: user.password
      }
    });

    const refreshTokenCookie = signInResponse.cookies.find((cookie) => cookie.name === 'refreshToken');
    assert.ok(refreshTokenCookie);

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh-token',
      cookies: {
        refreshToken: refreshTokenCookie.value
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      message: 'Access token refreshed successfully',
      data: {
        access_token: expect.any(String)
      }
    });
  });

  it('should reject if provide invalid refreshToken', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh-token',
      cookies: {
        refreshToken: 'invalid_refresh_token'
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "error": "Unauthorized",
        "message": "missing token",
        "statusCode": 401,
      }
    `);
  });

  it("should reject if the refreshToken's jti is not found in database", async () => {
    const user = users[0];
    const signInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: user.email,
        password: user.password
      }
    });

    const refreshTokenCookie = signInResponse.cookies.find((cookie) => cookie.name === 'refreshToken');
    assert.ok(refreshTokenCookie);

    // Delete the stored refresh token jti to simulate not found in database
    const decodedCookie = app.unsignCookie(refreshTokenCookie.value);
    assert.ok(decodedCookie.valid);
    const decodedRefreshToken = app.jwt.verify<RefreshToken>(decodedCookie.value);
    await jwtUtils.revokeRefreshToken(decodedRefreshToken.sub, decodedRefreshToken.jti);

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh-token',
      cookies: {
        refreshToken: refreshTokenCookie.value
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "error": "Unauthorized",
        "message": "Untrusted authorization token",
        "statusCode": 401,
      }
    `);
  });
});
