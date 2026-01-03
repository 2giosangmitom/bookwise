import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

interface BookResponse {
  book_id: string;
  title: string;
  description: string;
  isbn: string;
  published_at: string;
  publisher_id: string | null;
  publisher_name: string | null;
  image_url: string | null;
  authors: Array<{ author_id: string; name: string }>;
  categories: Array<{ category_id: string; name: string }>;
  created_at: string;
  updated_at: string;
}

describe('GET /api/staff/book', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};
  let publisherId: string;
  let createdBookIds: string[] = [];

  const createBookForTest = async (
    overrides: Partial<{
      title: string;
      isbn: string;
      publisher_id: string;
    }> = {}
  ) => {
    const payload = {
      title: overrides.title ?? faker.lorem.sentence(),
      description: faker.lorem.paragraphs(2),
      isbn: overrides.isbn ?? faker.string.numeric(13),
      published_at: faker.date.past().toISOString(),
      publisher_id: overrides.publisher_id ?? publisherId,
      authors: [],
      categories: []
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    createdBookIds.push(body.data.book_id);
    return body.data;
  };

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.LIBRARIAN] = await getAccessToken(app, users[1]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);

    // Create a publisher for testing
    const publisherResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: {
        name: 'Test Publisher',
        website: 'https://testpublisher.com',
        slug: 'test-publisher'
      }
    });

    const publisherData = publisherResponse.json();
    publisherId = publisherData.data.publisher_id;
  });

  afterEach(async () => {
    if (createdBookIds.length > 0) {
      await app.prisma.book.deleteMany({ where: { book_id: { in: createdBookIds } } });
      createdBookIds = [];
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/book'
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject MEMBER role', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/book',
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` }
    });

    expect(response.statusCode).toBe(403);
  });

  it.each([{ role: Role.ADMIN }, { role: Role.LIBRARIAN }])('should allow $role to list books', async ({ role }) => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/book',
      headers: { Authorization: `Bearer ${accessTokens[role]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.meta.total).toBeDefined();
    expect(body.meta.totalOnPage).toBeDefined();
    expect(body.meta.page).toBeDefined();
    expect(body.meta.limit).toBeDefined();
  });

  it('should list books with default pagination', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/book',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('should support custom pagination parameters', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/book?page=1&limit=5',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.length).toBeLessThanOrEqual(5);
  });

  it('should filter books by title using searchTerm', async () => {
    // Create a test book with a specific title
    const bookTitle = `The Lord of the Rings Test ${faker.string.alphanumeric(6)}`;
    await createBookForTest({
      title: bookTitle
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/staff/book?searchTerm=${encodeURIComponent(bookTitle)}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: BookResponse[] };
    const foundBook = body.data.find((book: BookResponse) => book.title === bookTitle);
    expect(foundBook).toBeDefined();
  });

  it('should filter books case-insensitively using searchTerm', async () => {
    // Create a test book
    const bookTitle = `The Hobbit Test ${faker.string.alphanumeric(6)}`;
    await createBookForTest({
      title: bookTitle
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/staff/book?searchTerm=${encodeURIComponent('the hobbit')}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: BookResponse[] };
    const foundBook = body.data.find((book: BookResponse) => book.title.toLowerCase().includes('the hobbit'));
    expect(foundBook).toBeDefined();
  });

  it('should filter books by ISBN using searchTerm', async () => {
    // Create a test book with a specific ISBN
    const isbn = `${faker.string.numeric(13)}`;
    await createBookForTest({
      isbn
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/staff/book?searchTerm=${isbn}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: BookResponse[] };
    const foundBook = body.data.find((book: BookResponse) => book.isbn === isbn);
    expect(foundBook).toBeDefined();
  });

  it('should search books by description using searchTerm', async () => {
    // Create a test book with a unique description
    const uniqueWord = `unique-${faker.string.alphanumeric(10)}`;
    await createBookForTest({
      title: faker.lorem.sentence()
    });

    // Need to update the book description directly
    const book = await app.prisma.book.findFirst({
      where: { book_id: { in: createdBookIds } },
      orderBy: { created_at: 'desc' }
    });

    if (book) {
      await app.prisma.book.update({
        where: { book_id: book.book_id },
        data: { description: `This book contains ${uniqueWord} in its description` }
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/staff/book?searchTerm=${uniqueWord}`,
        headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
      });

      expect(response.statusCode).toBe(200);
      const body = response.json() as { data: BookResponse[] };
      const foundBook = body.data.find((b: BookResponse) => b.book_id === book.book_id);
      expect(foundBook).toBeDefined();
    }
  });

  it('should return correct response format', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/book',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      data: BookResponse[];
      meta: { total: number; page: number; limit: number };
      message: string;
    };
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(body.meta).toHaveProperty('total');
    expect(body.meta).toHaveProperty('page');
    expect(body.meta).toHaveProperty('limit');
    expect(body).toHaveProperty('message');

    if (body.data.length > 0) {
      const book = body.data[0];
      expect(book).toHaveProperty('book_id');
      expect(book).toHaveProperty('title');
      expect(book).toHaveProperty('isbn');
      expect(book).toHaveProperty('publisher_id');
      expect(book).toHaveProperty('publisher_name');
      expect(book).toHaveProperty('created_at');
      expect(book).toHaveProperty('updated_at');
      expect(Array.isArray(book.authors)).toBe(true);
      expect(Array.isArray(book.categories)).toBe(true);
      if (book.authors.length > 0) {
        expect(book.authors[0]).toHaveProperty('author_id');
        expect(book.authors[0]).toHaveProperty('name');
      }
      if (book.categories.length > 0) {
        expect(book.categories[0]).toHaveProperty('category_id');
        expect(book.categories[0]).toHaveProperty('name');
      }
    }
  });

  it('should return empty list when no books match filters', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/book?searchTerm=nonexistent_book_title_xyz_12345',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: BookResponse[] };
    expect(body.data).toEqual([]);
  });
});
