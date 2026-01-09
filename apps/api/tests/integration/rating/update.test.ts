import { build, users } from '../helpers/build';
import { getAccessToken } from '../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('PUT /api/rating/:rating_id', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};
  let testBookId: string;
  let testRatingId: string;

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);
    accessTokens[Role.LIBRARIAN] = await getAccessToken(app, users[1]);

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
    const ratingResponse = await app.inject({
      method: 'POST',
      url: '/api/rating',
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` },
      payload: {
        book_id: testBookId,
        rate: 3,
        comment: 'Okay book'
      }
    });
    testRatingId = ratingResponse.json().data.rating_id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/api/rating/${testRatingId}`,
      payload: {
        rate: 5,
        comment: 'Updated: Great book!'
      }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject update by different user', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/api/rating/${testRatingId}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}` },
      payload: {
        rate: 1,
        comment: 'Trying to change someone else rating'
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should update rating by owner', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/api/rating/${testRatingId}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` },
      payload: {
        rate: 5,
        comment: 'Updated: Actually a great book!'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      message: expect.any(String),
      data: {
        rating_id: testRatingId,
        rate: 5,
        comment: 'Updated: Actually a great book!'
      }
    });
  });

  it('should return 404 for non-existent rating', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/api/rating/${faker.string.uuid()}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` },
      payload: {
        rate: 5,
        comment: 'Great book!'
      }
    });

    expect(response.statusCode).toBe(404);
  });
});
