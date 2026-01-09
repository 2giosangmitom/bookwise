import { build, users } from '../helpers/build';
import { getAccessToken } from '../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('GET /api/rating/book/:book_id', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};
  let testBookId: string;

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);

    // Create a test book
    const bookResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null
      }
    });
    testBookId = bookResponse.json().data.book_id;

    // Create a rating
    await app.inject({
      method: 'POST',
      url: '/api/rating',
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` },
      payload: {
        book_id: testBookId,
        rate: 4,
        comment: 'Good book!'
      }
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get ratings for a book without authentication', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/rating/book/${testBookId}`
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      message: expect.any(String),
      meta: {
        total: expect.any(Number),
        totalOnPage: expect.any(Number),
        page: 1,
        limit: 10,
        averageRating: expect.any(Number)
      },
      data: expect.any(Array)
    });
  });

  it('should return 404 for non-existent book', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/rating/book/${faker.string.uuid()}`
    });

    expect(response.statusCode).toBe(404);
  });

  it('should support pagination', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/rating/book/${testBookId}?page=1&limit=5`
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().meta.limit).toBe(5);
  });
});
