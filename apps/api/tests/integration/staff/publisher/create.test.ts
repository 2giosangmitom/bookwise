import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('POST /api/staff/publisher', async () => {
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
      url: '/api/staff/publisher',
      payload: { name: faker.company.name(), website: 'https://example.com', slug: faker.lorem.slug() }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject create request for MEMBER role', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` },
      payload: { name: faker.company.name(), website: 'https://example.com', slug: faker.lorem.slug() }
    });

    expect(response.statusCode).toBe(403);
  });

  it.each([{ role: Role.ADMIN }, { role: Role.LIBRARIAN }])(
    'should create publisher for $role role',
    async ({ role }) => {
      const data = {
        name: faker.company.name(),
        website: 'https://example.com',
        slug: faker.lorem.slug()
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/staff/publisher',
        headers: { Authorization: `Bearer ${accessTokens[role]}` },
        payload: data
      });

      expect(response.statusCode).toBe(201);
    }
  );

  it('should reject create publisher with duplicate slug', async () => {
    const duplicateSlug = faker.lorem.slug();

    const firstData = {
      name: faker.company.name(),
      website: 'https://example.com',
      slug: duplicateSlug
    };

    const firstResp = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: firstData
    });
    expect(firstResp.statusCode).toBe(201);

    const secondData = {
      name: faker.company.name(),
      website: 'https://example.com',
      slug: duplicateSlug
    };
    const secondResp = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: secondData
    });

    expect(secondResp.statusCode).toBe(409);
    expect(secondResp.json()).toMatchInlineSnapshot(`
      {
        "error": "Conflict",
        "message": "Publisher with the given slug already exists.",
        "statusCode": 409,
      }
    `);
  });
});
