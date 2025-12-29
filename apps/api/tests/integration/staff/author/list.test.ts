import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('GET /api/staff/author', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};
  let createdAuthorSlugs: string[] = [];

  const createAuthorForTest = async (
    overrides: Partial<{
      name: string;
      short_biography: string;
      biography: string;
      date_of_birth: string | null;
      date_of_death: string | null;
      nationality: string | null;
      slug: string;
    }>
  ) => {
    const payload = {
      name: overrides.name ?? faker.person.fullName(),
      short_biography: overrides.short_biography ?? faker.lorem.sentence(),
      biography: overrides.biography ?? faker.lorem.paragraphs(2),
      date_of_birth: overrides.date_of_birth ?? faker.date.past().toISOString(),
      date_of_death: overrides.date_of_death ?? null,
      nationality: overrides.nationality ?? faker.location.country(),
      slug: overrides.slug ?? faker.lorem.slug()
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    createdAuthorSlugs.push(body.data.slug);

    return body.data;
  };

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.LIBRARIAN] = await getAccessToken(app, users[1]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);
  });

  afterEach(async () => {
    if (createdAuthorSlugs.length > 0) {
      await app.prisma.author.deleteMany({
        where: {
          slug: {
            in: createdAuthorSlugs
          }
        }
      });
      createdAuthorSlugs = [];
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/author'
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject member role', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/author',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.MEMBER]}`
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should return authors with pagination and search filter', async () => {
    const marker = `list-${faker.string.alphanumeric(8).toLowerCase()}`;

    for (let i = 0; i < 3; i += 1) {
      await createAuthorForTest({
        name: `${marker}-author-${i}`,
        slug: `${marker}-slug-${i}`,
        nationality: 'Canada'
      });
    }

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/author',
      query: {
        search: marker
      },
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      }
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.data.meta).toEqual(
      expect.objectContaining({
        page: 1,
        limit: 10,
        total: 3,
        totalPages: 1
      })
    );
    expect(body.data.items).toHaveLength(3);
    expect(body.data.items.every((author: { name: string }) => author.name.includes(marker))).toBe(true);
  });

  it('should filter authors by alive status', async () => {
    const marker = `alive-${faker.string.alphanumeric(8).toLowerCase()}`;

    const aliveAuthor = await createAuthorForTest({
      name: `${marker}-alive`,
      slug: `${marker}-alive`,
      date_of_death: null
    });

    await createAuthorForTest({
      name: `${marker}-deceased`,
      slug: `${marker}-deceased`,
      date_of_death: faker.date.past().toISOString()
    });

    const aliveResponse = await app.inject({
      method: 'GET',
      url: '/api/staff/author',
      query: {
        search: marker,
        is_alive: 'true'
      },
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      }
    });

    expect(aliveResponse.statusCode).toBe(200);
    const aliveBody = aliveResponse.json();

    expect(aliveBody.data.meta.total).toBe(1);
    expect(aliveBody.data.items).toHaveLength(1);
    expect(aliveBody.data.items[0].author_id).toBe(aliveAuthor.author_id);
    expect(aliveBody.data.items[0].date_of_death).toBeNull();

    const deceasedResponse = await app.inject({
      method: 'GET',
      url: '/api/staff/author',
      query: {
        search: marker,
        is_alive: 'false'
      },
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      }
    });

    expect(deceasedResponse.statusCode).toBe(200);
    const deceasedBody = deceasedResponse.json();

    expect(deceasedBody.data.meta.total).toBe(1);
    expect(deceasedBody.data.items).toHaveLength(1);
    expect(deceasedBody.data.items[0].date_of_death).not.toBeNull();
  });

  it('should support sorting and pagination', async () => {
    const marker = `sort-${faker.string.alphanumeric(8).toLowerCase()}`;
    const names = ['Alpha', 'Bravo', 'Charlie'];

    for (const name of names) {
      await createAuthorForTest({
        name: `${marker}-${name}`,
        slug: `${marker}-${name.toLowerCase()}`
      });
    }

    const descResponse = await app.inject({
      method: 'GET',
      url: '/api/staff/author',
      query: {
        search: marker,
        sort_by: 'name',
        order: 'desc'
      },
      headers: {
        Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}`
      }
    });

    expect(descResponse.statusCode).toBe(200);
    const descBody = descResponse.json();

    expect(descBody.data.items[0].name).toBe(`${marker}-Charlie`);

    const paginatedResponse = await app.inject({
      method: 'GET',
      url: '/api/staff/author',
      query: {
        search: marker,
        sort_by: 'name',
        order: 'asc',
        page: '2',
        limit: '2'
      },
      headers: {
        Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}`
      }
    });

    expect(paginatedResponse.statusCode).toBe(200);
    const paginatedBody = paginatedResponse.json();

    expect(paginatedBody.data.meta).toEqual(
      expect.objectContaining({
        page: 2,
        limit: 2,
        total: 3,
        totalPages: 2
      })
    );
    expect(paginatedBody.data.items).toHaveLength(1);
    expect(paginatedBody.data.items[0].name).toBe(`${marker}-Charlie`);
  });
});
