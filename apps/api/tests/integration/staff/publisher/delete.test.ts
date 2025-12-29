import { faker } from '@faker-js/faker';
import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';

describe('DELETE /api/staff/publisher/:publisher_id', async () => {
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
    const response = await app.inject({ method: 'DELETE', url: `/api/staff/publisher/${faker.string.uuid()}` });
    expect(response.statusCode).toBe(401);
  });

  it('should reject deletion when the provided publisher id is not a valid uuid', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/publisher/invalid-uuid`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(400);
  });

  it('should reject deletion when the user is a member', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/publisher/${faker.string.uuid()}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` }
    });
    expect(response.statusCode).toBe(403);
  });

  it.each([{ role: Role.ADMIN }, { role: Role.LIBRARIAN }])(
    'should delete a publisher for $role role',
    async ({ role }) => {
      const createResp = await app.inject({
        method: 'POST',
        url: '/api/staff/publisher',
        headers: { Authorization: `Bearer ${accessTokens[role]}` },
        payload: { name: faker.company.name(), website: 'https://example.com', slug: faker.lorem.slug() }
      });
      const publisherId = createResp.json().data.publisher_id;

      const deleteResp = await app.inject({
        method: 'DELETE',
        url: `/api/staff/publisher/${publisherId}`,
        headers: { Authorization: `Bearer ${accessTokens[role]}` }
      });

      expect(deleteResp.statusCode).toBe(200);
      expect(deleteResp.json()).toMatchObject({
        message: 'Publisher deleted successfully',
        data: { publisher_id: publisherId }
      });
    }
  );

  it('should return 404 when trying to delete a non-existing publisher', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/publisher/${faker.string.uuid()}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });
    expect(response.statusCode).toBe(404);
  });
});
