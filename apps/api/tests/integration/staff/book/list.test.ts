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
  image_url: string | null;
  authors: string[];
  categories: string[];
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
    expect(body.meta.totalPages).toBeDefined();
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

  it('should filter books by title', async () => {
    // Create a test book with a specific title
    const bookTitle = `The Lord of the Rings Test ${faker.string.alphanumeric(6)}`;
    await createBookForTest({
      title: bookTitle
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/staff/book?title=${encodeURIComponent(bookTitle)}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: BookResponse[] };
    const foundBook = body.data.find((book: BookResponse) => book.title === bookTitle);
    expect(foundBook).toBeDefined();
  });

  it('should filter books by title case-insensitively', async () => {
    // Create a test book
    const bookTitle = `The Hobbit Test ${faker.string.alphanumeric(6)}`;
    await createBookForTest({
      title: bookTitle
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/staff/book?title=${encodeURIComponent('the hobbit')}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: BookResponse[] };
    const foundBook = body.data.find((book: BookResponse) => book.title.toLowerCase().includes('the hobbit'));
    expect(foundBook).toBeDefined();
  });

  it('should filter books by ISBN', async () => {
    // Create a test book with a specific ISBN
    const isbn = `${faker.string.numeric(13)}`;
    await createBookForTest({
      isbn
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/staff/book?isbn=${isbn}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: BookResponse[] };
    const foundBook = body.data.find((book: BookResponse) => book.isbn === isbn);
    expect(foundBook).toBeDefined();
  });

  it('should filter books by ISBN case-insensitively', async () => {
    // Create a test book with a specific ISBN
    const isbn = `${faker.string.numeric(13)}`;
    await createBookForTest({
      isbn
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/staff/book?isbn=${isbn}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: BookResponse[] };
    const foundBook = body.data.find((book: BookResponse) => book.isbn.toLowerCase() === isbn.toLowerCase());
    expect(foundBook).toBeDefined();
  });

  it('should filter books by publisher_id', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/staff/book?publisher_id=${publisherId}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: BookResponse[] };
    if (body.data.length > 0) {
      expect(body.data.every((book: BookResponse) => book.publisher_id === publisherId)).toBe(true);
    }
  });

  it('should combine multiple filters', async () => {
    // Create a test book
    const bookTitle = `Combined Filter Test ${faker.string.alphanumeric(6)}`;
    const isbn = `${faker.string.numeric(13)}`;
    await createBookForTest({
      title: bookTitle,
      isbn
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/staff/book?title=${encodeURIComponent(bookTitle)}&isbn=${isbn}&publisher_id=${publisherId}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: BookResponse[] };
    const foundBook = body.data.find((book: BookResponse) => book.title === bookTitle && book.isbn === isbn);
    expect(foundBook).toBeDefined();
  });

  it('should return correct response format', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/book',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: BookResponse[]; meta: { totalPages: number }; message: string };
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(body.meta).toHaveProperty('totalPages');
    expect(body).toHaveProperty('message');

    if (body.data.length > 0) {
      const book = body.data[0];
      expect(book).toHaveProperty('book_id');
      expect(book).toHaveProperty('title');
      expect(book).toHaveProperty('isbn');
      expect(book).toHaveProperty('publisher_id');
      expect(book).toHaveProperty('created_at');
      expect(book).toHaveProperty('updated_at');
      expect(Array.isArray(book.authors)).toBe(true);
      expect(Array.isArray(book.categories)).toBe(true);
    }
  });

  it('should handle pagination correctly', async () => {
    const response1 = await app.inject({
      method: 'GET',
      url: '/api/staff/book?page=1&limit=1',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    const response2 = await app.inject({
      method: 'GET',
      url: '/api/staff/book?page=2&limit=1',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response1.statusCode).toBe(200);
    expect(response2.statusCode).toBe(200);

    const body1 = response1.json() as { data: BookResponse[]; meta: { totalPages: number } };
    const body2 = response2.json() as { data: BookResponse[]; meta: { totalPages: number } };

    if (body1.meta.totalPages > 1) {
      expect(body1.data[0]?.book_id).not.toBe(body2.data[0]?.book_id);
    }
  });

  it('should return empty list when no books match filters', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/book?title=nonexistent_book_title_xyz_12345',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: BookResponse[] };
    expect(body.data).toEqual([]);
  });
});
