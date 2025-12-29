import { faker } from '@faker-js/faker';
import { passwordMinLength } from '@/constants';
import { build, users } from '../helpers/build';

describe('POST /api/auth/signin', async () => {
  const app = await build();

  afterAll(async () => {
    await app.close();
  });

  it('should reject signin with missing fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: faker.internet.email()
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "code": "FST_ERR_VALIDATION",
        "error": "Bad Request",
        "message": "body must have required properties password",
        "statusCode": 400,
      }
    `);
  });

  it('should reject signin with invalid email format', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: 'invalid-email-format',
        password: faker.internet.password({ length: 10 })
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "code": "FST_ERR_VALIDATION",
        "error": "Bad Request",
        "message": "body/email must match format "email"",
        "statusCode": 400,
      }
    `);
  });

  it('should reject signin with short password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: faker.internet.email(),
        password: faker.internet.password({ length: passwordMinLength - 1 })
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "code": "FST_ERR_VALIDATION",
        "error": "Bad Request",
        "message": "body/password must not have fewer than 6 characters",
        "statusCode": 400,
      }
    `);
  });

  it('should reject signin with incorrect credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: users[0].email,
        password: faker.internet.password({ length: users[0].password.length - 2 })
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "error": "Unauthorized",
        "message": "Invalid credentials",
        "statusCode": 401,
      }
    `);
  });

  it('should signin successfully with correct credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: users[0].email,
        password: users[0].password
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      message: expect.any(String),
      data: {
        access_token: expect.any(String)
      }
    });
  });

  it('should set refresh token cookie on successful signin', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: users[1].email,
        password: users[1].password
      }
    });

    expect(response.statusCode).toBe(200);
    const refreshTokenCookie = response.cookies.find((cookie) => cookie.name === 'refreshToken');
    expect(refreshTokenCookie).toBeDefined();
  });
});
