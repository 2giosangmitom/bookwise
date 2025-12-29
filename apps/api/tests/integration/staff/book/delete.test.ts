import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('DELETE /api/staff/book/:book_id', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.LIBRARIAN] = await getAccessToken(app, users[1]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([{ role: Role.ADMIN }, { role: Role.LIBRARIAN }])('should delete a book for $role role', async ({ role }) => {
    const bookData = {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(2),
      isbn: faker.string.numeric(13),
      published_at: faker.date.past().toISOString(),
      publisher_id: null
    };

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: { Authorization: `Bearer ${accessTokens[role]}` },
      payload: bookData
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json().data;

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/staff/book/${created.book_id}`,
      headers: { Authorization: `Bearer ${accessTokens[role]}` }
    });

    expect(deleteResponse.statusCode).toBe(200);
  });

  it('should reject delete for MEMBER role', async () => {
    const bookData = {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(2),
      isbn: faker.string.numeric(13),
      published_at: faker.date.past().toISOString(),
      publisher_id: null
    };

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: bookData
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json().data;

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/staff/book/${created.book_id}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` }
    });

    expect(deleteResponse.statusCode).toBe(403);
  });

  it('should return 404 when deleting non-existing book', async () => {
    const randomId = faker.string.uuid();

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/staff/book/${randomId}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(deleteResponse.statusCode).toBe(404);
  });
});
