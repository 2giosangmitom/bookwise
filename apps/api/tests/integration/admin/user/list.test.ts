import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';

describe('GET /api/admin/user', async () => {
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

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/admin/user'
    });

    expect(response.statusCode).toBe(401);
  });

  it.each([Role.LIBRARIAN, Role.MEMBER])('should reject non-admin role %s', async (role) => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/admin/user',
      headers: { Authorization: `Bearer ${accessTokens[role]}` }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should list users for ADMIN', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/admin/user',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      query: { page: '1', limit: '5' }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();

    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('meta');
    expect(body.meta).toHaveProperty('totalPages');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]).toHaveProperty('user_id');
    expect(body.data[0]).toHaveProperty('email');
    expect(body.data[0]).toHaveProperty('name');
    expect(body.data[0]).toHaveProperty('role');
  });

  it('should filter users by role', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/admin/user',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      query: { role: Role.LIBRARIAN }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    const roles = new Set(body.data.map((u: { role: Role }) => u.role));

    expect(roles.size).toBe(1);
    expect(roles.has(Role.LIBRARIAN)).toBe(true);
  });

  it('should filter users by email substring', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/admin/user',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      query: { email: 'user1' }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();

    expect(body.data.every((u: { email: string }) => u.email.toLowerCase().includes('user1'))).toBe(true);
  });
});
