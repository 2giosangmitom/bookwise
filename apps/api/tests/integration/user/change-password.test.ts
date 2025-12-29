import { build } from '../helpers/build';
import { passwordMinLength } from '@/constants';
import { faker } from '@faker-js/faker';

describe('PATCH /api/user/change-password', async () => {
  const app = await build();

  async function createUserAndGetAccessToken() {
    const email = faker.internet.email();
    const password = `Pwd${faker.string.alphanumeric({ length: 10 })}!`;
    const fullName = faker.person.fullName();

    const signupResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        email,
        password,
        fullName
      }
    });
    expect(signupResponse.statusCode).toBe(201);

    const signinResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email,
        password
      }
    });
    expect(signinResponse.statusCode).toBe(200);

    return {
      email,
      password,
      fullName,
      accessToken: signinResponse.json().data.access_token
    };
  }

  afterAll(async () => {
    await app.close();
  });

  it('should reject request without authentication token', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/user/change-password',
      payload: {
        current_password: 'OldPassword123!',
        new_password: 'NewPassword456!'
      }
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
      method: 'PATCH',
      url: '/api/user/change-password',
      headers: {
        authorization: 'Bearer invalid-token-here'
      },
      payload: {
        current_password: 'OldPassword123!',
        new_password: 'NewPassword456!'
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      statusCode: 401,
      error: 'Unauthorized'
    });
  });

  it('should reject request with missing current_password', async () => {
    const { accessToken } = await createUserAndGetAccessToken();

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/user/change-password',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        new_password: 'NewPassword456!'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "code": "FST_ERR_VALIDATION",
        "error": "Bad Request",
        "message": "body must have required properties current_password",
        "statusCode": 400,
      }
    `);
  });

  it('should reject request with missing new_password', async () => {
    const { accessToken } = await createUserAndGetAccessToken();

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/user/change-password',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        current_password: 'OldPassword123!'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "code": "FST_ERR_VALIDATION",
        "error": "Bad Request",
        "message": "body must have required properties new_password",
        "statusCode": 400,
      }
    `);
  });

  it('should reject request with short new_password', async () => {
    const { accessToken } = await createUserAndGetAccessToken();

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/user/change-password',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        current_password: 'OldPassword123!',
        new_password: 'a'.repeat(passwordMinLength - 1)
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "code": "FST_ERR_VALIDATION",
        "error": "Bad Request",
        "message": "body/new_password must not have fewer than 6 characters",
        "statusCode": 400,
      }
    `);
  });

  it('should reject request with incorrect current password', async () => {
    const { accessToken, password } = await createUserAndGetAccessToken();

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/user/change-password',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        current_password: `${password}-wrong`,
        new_password: 'NewPassword456!'
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "error": "Unauthorized",
        "message": "Current password is incorrect",
        "statusCode": 401,
      }
    `);
  });

  it('should successfully change password with correct current password', async () => {
    const { accessToken, password } = await createUserAndGetAccessToken();

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/user/change-password',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        current_password: password,
        new_password: 'NewPassword456!'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "message": "Password changed successfully",
      }
    `);
  });

  it('should allow login with new password after change', async () => {
    const newPassword = 'SuperNewPassword789!';
    const { accessToken, email, password } = await createUserAndGetAccessToken();

    // Change password
    const changeResponse = await app.inject({
      method: 'PATCH',
      url: '/api/user/change-password',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        current_password: password,
        new_password: newPassword
      }
    });

    expect(changeResponse.statusCode).toBe(200);

    // Try to login with new password
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email,
        password: newPassword
      }
    });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.json()).toHaveProperty('data.access_token');
  });

  it('should not allow login with old password after change', async () => {
    const newPassword = 'AnotherNewPassword999!';
    const { accessToken, email, password } = await createUserAndGetAccessToken();

    // Change password
    const changeResponse = await app.inject({
      method: 'PATCH',
      url: '/api/user/change-password',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        current_password: password,
        new_password: newPassword
      }
    });

    expect(changeResponse.statusCode).toBe(200);

    // Try to login with old password (should fail)
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email,
        password
      }
    });

    expect(loginResponse.statusCode).toBe(401);
    expect(loginResponse.json()).toMatchObject({
      error: 'Unauthorized',
      message: 'Invalid credentials'
    });
  });
});
