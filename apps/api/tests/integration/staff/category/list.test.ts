import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('GET /api/staff/category', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};
  let createdSlugs: string[] = [];

  const createCategoryForTest = async (
    overrides: Partial<{
      name: string;
      slug: string;
    }> = {}
  ) => {
    const payload = {
      name: overrides.name ?? faker.commerce.department(),
      slug: overrides.slug ?? faker.lorem.slug()
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    createdSlugs.push(body.data.slug);

    return body.data;
  };

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.LIBRARIAN] = await getAccessToken(app, users[1]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);
  });

  afterEach(async () => {
    if (createdSlugs.length > 0) {
      await app.prisma.category.deleteMany({
        where: {
          slug: {
            in: createdSlugs
          }
        }
      });
      createdSlugs = [];
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/category'
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject member role', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/category',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.MEMBER]}`
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should list categories with pagination and name filter', async () => {
    const marker = `cat-${faker.string.alphanumeric(8).toLowerCase()}`;

    for (let i = 0; i < 3; i += 1) {
      await createCategoryForTest({
        name: `${marker}-name-${i}`,
        slug: `${marker}-slug-${i}`
      });
    }

    const firstPageResponse = await app.inject({
      method: 'GET',
      url: '/api/staff/category',
      query: {
        name: marker,
        limit: '2',
        page: '1'
      },
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      }
    });

    expect(firstPageResponse.statusCode).toBe(200);
    const firstBody = firstPageResponse.json();

    expect(firstBody.meta).toEqual({
      limit: 2,
      total: expect.any(Number),
      totalOnPage: expect.any(Number),
      page: 1
    });
    expect(firstBody.data.every((category: { name: string }) => category.name.toLowerCase().includes(marker))).toBe(
      true
    );

    const secondPageResponse = await app.inject({
      method: 'GET',
      url: '/api/staff/category',
      query: {
        name: marker,
        limit: '2',
        page: '2'
      },
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      }
    });

    expect(secondPageResponse.statusCode).toBe(200);
    const secondBody = secondPageResponse.json();

    expect(secondBody.meta).toEqual({
      total: expect.any(Number),
      totalOnPage: expect.any(Number),
      page: 2,
      limit: 2
    });
  });
});
