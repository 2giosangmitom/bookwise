import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('GET /api/staff/publisher', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};
  let createdPublisherIds: string[] = [];

  const createPublisherForTest = async (
    overrides: Partial<{
      name: string;
      website: string;
      slug: string;
    }> = {}
  ) => {
    const payload = {
      name: overrides.name ?? faker.company.name(),
      website: overrides.website ?? `https://${faker.lorem.slug()}.com`,
      slug: overrides.slug ?? faker.lorem.slug()
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    createdPublisherIds.push(body.data.publisher_id);
    return body.data;
  };

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.LIBRARIAN] = await getAccessToken(app, users[1]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);
  });

  afterEach(async () => {
    if (createdPublisherIds.length > 0) {
      await app.prisma.publisher.deleteMany({ where: { publisher_id: { in: createdPublisherIds } } });
      createdPublisherIds = [];
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/publisher'
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject member role', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/publisher',
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should list publishers with pagination', async () => {
    const marker = faker.string.alphanumeric(6).toLowerCase();

    await createPublisherForTest({
      name: `Publisher ${marker} 1`,
      slug: `pub-${marker}-1`
    });
    await createPublisherForTest({
      name: `Publisher ${marker} 2`,
      slug: `pub-${marker}-2`
    });
    await createPublisherForTest({
      name: `Publisher ${marker} 3`,
      slug: `pub-${marker}-3`
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/publisher',
      query: {
        limit: '2',
        page: '1'
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data).toHaveLength(2);
    expect(body.meta.totalPages).toBeGreaterThanOrEqual(2);
    expect(body.message).toBe('Publishers retrieved successfully');
  });

  it('should filter publishers by name', async () => {
    const marker = faker.string.alphanumeric(6).toLowerCase();

    const created1 = await createPublisherForTest({
      name: `Penguin ${marker}`,
      slug: `penguin-${marker}`
    });
    await createPublisherForTest({
      name: `Random Publisher ${marker}`,
      slug: `random-${marker}`
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/publisher',
      query: {
        name: 'Penguin'
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.some((p: { publisher_id: string }) => p.publisher_id === created1.publisher_id)).toBe(true);
  });

  it('should filter publishers by website', async () => {
    const marker = faker.string.alphanumeric(6).toLowerCase();

    const created = await createPublisherForTest({
      website: `https://penguin-${marker}.com`
    });
    await createPublisherForTest({
      website: `https://random-${marker}.com`
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/publisher',
      query: {
        website: `penguin-${marker}`
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.some((p: { publisher_id: string }) => p.publisher_id === created.publisher_id)).toBe(true);
  });

  it('should filter publishers by slug', async () => {
    const marker = faker.string.alphanumeric(6).toLowerCase();

    const created = await createPublisherForTest({
      slug: `penguin-${marker}`
    });
    await createPublisherForTest({
      slug: `random-${marker}`
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/publisher',
      query: {
        slug: `penguin-${marker}`
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].publisher_id).toBe(created.publisher_id);
  });

  it('should combine multiple filters', async () => {
    const marker = faker.string.alphanumeric(6).toLowerCase();

    const created = await createPublisherForTest({
      name: `Penguin ${marker}`,
      website: `https://penguin-${marker}.com`,
      slug: `penguin-${marker}`
    });
    await createPublisherForTest({
      name: `Penguin Other`,
      website: `https://other.com`,
      slug: `other-${marker}`
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/publisher',
      query: {
        name: 'Penguin',
        website: `penguin-${marker}`,
        slug: `penguin-${marker}`
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.some((p: { publisher_id: string }) => p.publisher_id === created.publisher_id)).toBe(true);
  });

  it('should support case-insensitive search', async () => {
    const marker = faker.string.alphanumeric(6).toLowerCase();

    const created = await createPublisherForTest({
      name: `UPPERCASE ${marker}`,
      slug: `uppercase-${marker}`
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/publisher',
      query: {
        name: 'uppercase'
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.some((p: { publisher_id: string }) => p.publisher_id === created.publisher_id)).toBe(true);
  });

  it('should return correct response format', async () => {
    await createPublisherForTest();

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/publisher',
      query: { limit: '10', page: '1' },
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();

    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('meta');
    expect(body).toHaveProperty('data');
    expect(body.meta).toHaveProperty('totalPages');
    expect(Array.isArray(body.data)).toBe(true);

    if (body.data.length > 0) {
      const publisher = body.data[0];
      expect(publisher).toHaveProperty('publisher_id');
      expect(publisher).toHaveProperty('name');
      expect(publisher).toHaveProperty('website');
      expect(publisher).toHaveProperty('slug');
      expect(publisher).toHaveProperty('image_url');
      expect(publisher).toHaveProperty('created_at');
      expect(publisher).toHaveProperty('updated_at');
    }
  });

  it('should handle pagination correctly', async () => {
    const marker = faker.string.alphanumeric(6).toLowerCase();

    for (let i = 0; i < 5; i++) {
      await createPublisherForTest({
        name: `Publisher ${marker} ${i}`,
        slug: `pub-${marker}-${i}`
      });
    }

    const page1Response = await app.inject({
      method: 'GET',
      url: '/api/staff/publisher',
      query: {
        limit: '2',
        page: '1'
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(page1Response.statusCode).toBe(200);
    const page1Body = page1Response.json();
    expect(page1Body.data).toHaveLength(2);

    const page2Response = await app.inject({
      method: 'GET',
      url: '/api/staff/publisher',
      query: {
        limit: '2',
        page: '2'
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}` }
    });

    expect(page2Response.statusCode).toBe(200);
    const page2Body = page2Response.json();
    expect(page2Body.data).toHaveLength(2);

    // Ensure different pages return different results
    const page1Ids = page1Body.data.map((p: { publisher_id: string }) => p.publisher_id);
    const page2Ids = page2Body.data.map((p: { publisher_id: string }) => p.publisher_id);
    expect(page1Ids).not.toEqual(page2Ids);
  });

  it.each([{ role: Role.ADMIN }, { role: Role.LIBRARIAN }])(
    'should allow $role to list publishers',
    async ({ role }) => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/staff/publisher',
        headers: { Authorization: `Bearer ${accessTokens[role]}` }
      });

      expect(response.statusCode).toBe(200);
    }
  );
});
