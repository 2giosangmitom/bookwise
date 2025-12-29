import { faker } from '@faker-js/faker';
import { passwordMinLength } from '@/constants';
import { build } from '../helpers/build';

describe('POST /api/auth/signup', async () => {
  const app = await build();

  afterAll(async () => {
    await app.close();
  });

  it('should reject signup with missing fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 10 })
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "code": "FST_ERR_VALIDATION",
        "error": "Bad Request",
        "message": "body must have required properties fullName",
        "statusCode": 400,
      }
    `);
  });

  it('should reject signup with invalid email format', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        fullName: faker.person.fullName(),
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

  it('should reject signup with short password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        fullName: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password({ length: passwordMinLength - 2 })
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

  it('should signup successfully with valid data', async () => {
    const fullName = faker.person.fullName();
    const email = faker.internet.email();
    const password = faker.internet.password({ length: 10 });

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        fullName,
        email,
        password
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      message: expect.any(String),
      data: {
        user_id: expect.any(String),
        name: fullName,
        email: email,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }
    });
  });

  it('should reject signup with an already registered email', async () => {
    const fullName = faker.person.fullName();
    const email = faker.internet.email();
    const password = faker.internet.password({ length: 10 });

    // First signup attempt
    const firstResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        fullName,
        email,
        password
      }
    });

    expect(firstResponse.statusCode).toBe(201);

    // Second signup attempt with the same email
    const secondResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        fullName: faker.person.fullName(),
        email,
        password: faker.internet.password({ length: 10 })
      }
    });

    expect(secondResponse.statusCode).toBe(409);
    expect(secondResponse.json()).toMatchInlineSnapshot(`
      {
        "error": "Conflict",
        "message": "Email is already in use",
        "statusCode": 409,
      }
    `);
  });
});
