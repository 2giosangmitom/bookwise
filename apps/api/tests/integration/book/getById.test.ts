import { build, users } from '../helpers/build';
import { getAccessToken } from '../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('GET /api/book/:book_id', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};
  let testBookId: string;
  const testBookTitle = faker.lorem.sentence();

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);

    // Create a test book
    const bookResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: {
        title: testBookTitle,
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null
      }
    });
    testBookId = bookResponse.json().data.book_id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get book by ID without authentication', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/book/${testBookId}`
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      message: expect.any(String),
      data: {
        book_id: testBookId,
        title: testBookTitle,
        description: expect.any(String),
        isbn: expect.any(String),
        available_copies: expect.any(Number),
        total_copies: expect.any(Number),
        average_rating: null, // No ratings yet
        rating_count: 0
      }
    });
  });

  it('should return 404 for non-existent book', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/book/${faker.string.uuid()}`
    });

    expect(response.statusCode).toBe(404);
  });

  it('should include authors and categories', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/book/${testBookId}`
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toHaveProperty('authors');
    expect(response.json().data).toHaveProperty('categories');
    expect(Array.isArray(response.json().data.authors)).toBe(true);
    expect(Array.isArray(response.json().data.categories)).toBe(true);
  });
});
