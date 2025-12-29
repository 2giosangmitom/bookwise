import { faker } from '@faker-js/faker';
import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';

describe('DELETE /api/staff/author/:author_id', async () => {
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

  it('should reject deletion when no token is provided', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/author/${faker.string.uuid()}`
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject deletion when the provided author id is not a valid uuid', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/author/invalid-uuid`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      }
    });

    expect(response.statusCode).toBe(400);
  });

  it('should reject deletion when the user is a member', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/author/${faker.string.uuid()}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.MEMBER]}`
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it.each([{ role: Role.ADMIN }, { role: Role.LIBRARIAN }])(
    'should delete an author when the user is $role',
    async ({ role }) => {
      // First, create a new author to delete
      const createAuthorResponse = await app.inject({
        method: 'POST',
        url: '/api/staff/author',
        headers: {
          Authorization: `Bearer ${accessTokens[role]}`
        },
        payload: {
          name: faker.person.fullName(),
          short_biography: faker.lorem.sentence(),
          biography: faker.lorem.paragraphs(3),
          date_of_birth: faker.date.past().toISOString(),
          date_of_death: null,
          nationality: null,
          slug: faker.lorem.slug()
        }
      });

      const authorId = createAuthorResponse.json().data.author_id;

      // Now, delete the created author
      const deleteAuthorResponse = await app.inject({
        method: 'DELETE',
        url: `/api/staff/author/${authorId}`,
        headers: {
          Authorization: `Bearer ${accessTokens[role]}`
        }
      });

      expect(deleteAuthorResponse.statusCode).toBe(200);
      expect(deleteAuthorResponse.json()).toMatchObject({
        message: 'Author deleted successfully',
        data: {
          author_id: authorId
        }
      });
    }
  );

  it('should return 404 when trying to delete a non-existing author', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/author/${faker.string.uuid()}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      }
    });

    expect(response.statusCode).toBe(404);
  });
});
