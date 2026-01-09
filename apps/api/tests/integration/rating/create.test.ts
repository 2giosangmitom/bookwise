import { build, users } from '../helpers/build';
import { getAccessToken } from '../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('POST /api/rating', async () => {
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/rating',
      payload: {
        book_id: testBookId,
        rate: 5,
        comment: 'Great book!'
      }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should create rating for authenticated user', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/rating',
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` },
      payload: {
        book_id: testBookId,
        rate: 5,
        comment: 'Excellent book, highly recommended!'
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      message: expect.any(String),
      data: {
        rating_id: expect.any(String),
        book_id: testBookId,
        rate: 5,
        comment: 'Excellent book, highly recommended!'
      }
    });
  });

  it('should reject duplicate rating for same book', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/rating',
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` },
      payload: {
        book_id: testBookId,
        rate: 4,
        comment: 'Another review'
      }
    });

    expect(response.statusCode).toBe(409);
  });

  it('should reject rating with invalid rate value', async () => {
    // Create another book for this test
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
    const newBookId = bookResponse.json().data.book_id;

    const response = await app.inject({
      method: 'POST',
      url: '/api/rating',
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` },
      payload: {
        book_id: newBookId,
        rate: 6, // Invalid: max is 5
        comment: 'Great book!'
      }
    });

    expect(response.statusCode).toBe(400);
  });

  it('should reject rating for non-existent book', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/rating',
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` },
      payload: {
        book_id: faker.string.uuid(),
        rate: 5,
        comment: 'Great book!'
      }
    });

    expect(response.statusCode).toBe(404);
  });
});
