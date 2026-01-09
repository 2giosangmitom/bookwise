import { build, users } from '../helpers/build';
import { getAccessToken } from '../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('GET /api/book/search', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};
  let testCategoryId: string;
  let testAuthorId: string;
  const testBookTitle = `SearchTest-${faker.string.alphanumeric(10)}`;

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);

    // Create a test category
    const categoryResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: {
        name: `Test Category ${faker.string.alphanumeric(5)}`,
        slug: faker.helpers.slugify(`test-${faker.string.alphanumeric(10)}`)
      }
    });
    testCategoryId = categoryResponse.json().data.category_id;

    // Create a test author
    const authorResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(2),
        slug: faker.helpers.slugify(`author-${faker.string.alphanumeric(10)}`)
      }
    });
    testAuthorId = authorResponse.json().data.author_id;

    // Create a test book with the category and author
    await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: {
        title: testBookTitle,
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null,
        categories: [testCategoryId],
        authors: [testAuthorId]
      }
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should search books without authentication', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/book/search'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      message: expect.any(String),
      meta: {
        total: expect.any(Number),
        totalOnPage: expect.any(Number),
        page: 1,
        limit: 12
      },
      data: expect.any(Array)
    });
  });

  it('should search books by title', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/book/search?searchTerm=${testBookTitle}`
    });

    expect(response.statusCode).toBe(200);
    const books = response.json().data;
    expect(books.some((b: { title: string }) => b.title === testBookTitle)).toBe(true);
  });

  it('should filter books by category', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/book/search?category_id=${testCategoryId}`
    });

    expect(response.statusCode).toBe(200);
    const books = response.json().data;
    expect(books.length).toBeGreaterThan(0);
    books.forEach((book: { categories: { category_id: string }[] }) => {
      expect(book.categories.some((c) => c.category_id === testCategoryId)).toBe(true);
    });
  });

  it('should filter books by author', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/book/search?author_id=${testAuthorId}`
    });

    expect(response.statusCode).toBe(200);
    const books = response.json().data;
    expect(books.length).toBeGreaterThan(0);
    books.forEach((book: { authors: { author_id: string }[] }) => {
      expect(book.authors.some((a) => a.author_id === testAuthorId)).toBe(true);
    });
  });

  it('should support pagination', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/book/search?page=1&limit=5'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().meta.limit).toBe(5);
    expect(response.json().data.length).toBeLessThanOrEqual(5);
  });

  it('should support sorting by title', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/book/search?sort_by=title'
    });

    expect(response.statusCode).toBe(200);
    const books = response.json().data;
    if (books.length > 1) {
      for (let i = 1; i < books.length; i++) {
        expect(books[i].title.localeCompare(books[i - 1].title)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('should include availability information', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/book/search'
    });

    expect(response.statusCode).toBe(200);
    const books = response.json().data;
    if (books.length > 0) {
      expect(books[0]).toHaveProperty('available_copies');
      expect(books[0]).toHaveProperty('total_copies');
      expect(books[0]).toHaveProperty('average_rating');
      expect(books[0]).toHaveProperty('rating_count');
    }
  });
});
