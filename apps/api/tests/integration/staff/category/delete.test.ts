import { faker } from '@faker-js/faker';
import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';

describe('DELETE /api/staff/category/:category_id', async () => {
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
      url: `/api/staff/category/${faker.string.uuid()}`
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject deletion when the provided category id is not a valid uuid', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/category/invalid-uuid`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      }
    });

    expect(response.statusCode).toBe(400);
  });

  it('should reject deletion when the user is a member', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/category/${faker.string.uuid()}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.MEMBER]}`
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it.each([{ role: Role.ADMIN }, { role: Role.LIBRARIAN }])(
    'should delete a category for $role role',
    async ({ role }) => {
      // First, create a new category to delete
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/staff/category',
        headers: {
          Authorization: `Bearer ${accessTokens[role]}`
        },
        payload: { name: faker.lorem.word(), slug: faker.lorem.slug() }
      });

      const categoryId = createResponse.json().data.category_id;

      // Now delete
      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/staff/category/${categoryId}`,
        headers: { Authorization: `Bearer ${accessTokens[role]}` }
      });

      expect(deleteResponse.statusCode).toBe(200);
      expect(deleteResponse.json()).toMatchObject({
        message: 'Category deleted successfully',
        data: { category_id: categoryId }
      });
    }
  );

  it('should return 404 when trying to delete a non-existing category', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/category/${faker.string.uuid()}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(404);
  });
});
