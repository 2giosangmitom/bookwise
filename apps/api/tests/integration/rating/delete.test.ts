import { build, users } from '../helpers/build';
import { getAccessToken } from '../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('DELETE /api/rating/:rating_id', async () => {
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
        rate: 4,
        comment: 'Good book!'
      }
    });
    testRatingId = ratingResponse.json().data.rating_id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/rating/${testRatingId}`
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject delete by different user', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/rating/${testRatingId}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}` }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should return 404 for non-existent rating', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/rating/${faker.string.uuid()}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` }
    });

    expect(response.statusCode).toBe(404);
  });

  it('should delete rating by owner', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/rating/${testRatingId}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      message: expect.any(String),
      data: {
        rating_id: testRatingId
      }
    });

    // Verify rating is deleted
    const verifyResponse = await app.inject({
      method: 'DELETE',
      url: `/api/rating/${testRatingId}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` }
    });
    expect(verifyResponse.statusCode).toBe(404);
  });
});
