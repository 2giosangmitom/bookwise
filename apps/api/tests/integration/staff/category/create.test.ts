import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('POST /api/staff/category', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.LIBRARIAN] = await getAccessToken(app, users[1]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      payload: {
        name: faker.lorem.word(),
        slug: faker.lorem.slug()
      }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject create request for MEMBER role', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.MEMBER]}`
      },
      payload: {
        name: faker.lorem.word(),
        slug: faker.lorem.slug()
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it.each([{ role: Role.ADMIN }, { role: Role.LIBRARIAN }])(
    'should create category for $role role',
    async ({ role }) => {
      const data = { name: faker.lorem.word(), slug: faker.lorem.slug() };

      const response = await app.inject({
        method: 'POST',
        url: '/api/staff/category',
        headers: { Authorization: `Bearer ${accessTokens[role]}` },
        payload: data
      });

      expect(response.statusCode).toBe(201);
    }
  );

  it('should reject duplicate slug', async () => {
    const duplicate = faker.lorem.slug();

    const first = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: { name: faker.lorem.word(), slug: duplicate }
    });

    expect(first.statusCode).toBe(201);

    const second = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: { name: faker.lorem.word(), slug: duplicate }
    });

    expect(second.statusCode).toBe(409);
  });
});
