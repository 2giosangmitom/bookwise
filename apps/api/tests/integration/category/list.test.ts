import { build, users } from '../helpers/build';
import { getAccessToken } from '../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('GET /api/category', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};
  let testCategorySlug: string;

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);

    // Create a test category
    testCategorySlug = faker.helpers.slugify(`test-${faker.string.alphanumeric(10)}`);
    await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: {
        name: `Test Category ${faker.string.alphanumeric(5)}`,
        slug: testCategorySlug
      }
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get categories without authentication', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/category'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      message: expect.any(String),
      meta: {
        total: expect.any(Number),
        totalOnPage: expect.any(Number),
        page: 1,
        limit: 50
      },
      data: expect.any(Array)
    });
  });

  it('should include book count for each category', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/category'
    });

    expect(response.statusCode).toBe(200);
    const categories = response.json().data;
    if (categories.length > 0) {
      expect(categories[0]).toHaveProperty('book_count');
      expect(typeof categories[0].book_count).toBe('number');
    }
  });

  it('should support pagination', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/category?page=1&limit=5'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().meta.limit).toBe(5);
  });
});

describe('GET /api/category/:slug', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};
  let testCategorySlug: string;
  let testCategoryId: string;

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);

    // Create a test category
    testCategorySlug = faker.helpers.slugify(`slug-test-${faker.string.alphanumeric(10)}`);
    const categoryResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: {
        name: `Category for Slug Test`,
        slug: testCategorySlug
      }
    });
    testCategoryId = categoryResponse.json().data.category_id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get category by slug without authentication', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/category/${testCategorySlug}`
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      message: expect.any(String),
      data: {
        category_id: testCategoryId,
        name: 'Category for Slug Test',
        slug: testCategorySlug,
        book_count: expect.any(Number)
      }
    });
  });

  it('should return 404 for non-existent slug', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/category/non-existent-slug-12345'
    });

    expect(response.statusCode).toBe(404);
  });
});
