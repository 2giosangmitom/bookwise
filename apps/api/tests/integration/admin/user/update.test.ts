import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('PUT /api/admin/user/:userId', async () => {
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

  async function createTestUser(role: Role = Role.MEMBER) {
    const email = faker.internet.email();
    const password = 'TestPassword123!';
    const fullName = faker.person.fullName();

    const signupResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: { email, password, fullName }
    });

    if (signupResponse.statusCode !== 201) {
      throw new Error(`Failed to create test user: ${signupResponse.statusCode}`);
    }

    const user = await app.prisma.user.findUnique({
      where: { email }
    });

    if (role !== Role.MEMBER) {
      await app.prisma.user.update({
        where: { user_id: user!.user_id },
        data: { role }
      });
    }

    return { user_id: user!.user_id, email, password };
  }

  it('should reject unauthenticated requests', async () => {
    const testUser = await createTestUser();
    const response = await app.inject({
      method: 'PUT',
      url: `/api/admin/user/${testUser.user_id}`,
      headers: { 'Content-Type': 'application/json' },
      payload: { name: 'New Name' }
    });

    expect(response.statusCode).toBe(401);
  });

  it.each([Role.LIBRARIAN, Role.MEMBER])('should reject non-admin role %s', async (role) => {
    const testUser = await createTestUser();
    const response = await app.inject({
      method: 'PUT',
      url: `/api/admin/user/${testUser.user_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[role]!}`,
        'Content-Type': 'application/json'
      },
      payload: { name: 'New Name' }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should return 404 for non-existent user', async () => {
    const fakeUserId = faker.string.uuid();
    const response = await app.inject({
      method: 'PUT',
      url: `/api/admin/user/${fakeUserId}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`,
        'Content-Type': 'application/json'
      },
      payload: { name: 'New Name' }
    });

    expect(response.statusCode).toBe(404);
    const body = response.json();
    expect(body.error).toBe('Not Found');
  });

  it('should update user name', async () => {
    const testUser = await createTestUser();
    const newName = faker.person.fullName();
    const response = await app.inject({
      method: 'PUT',
      url: `/api/admin/user/${testUser.user_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`,
        'Content-Type': 'application/json'
      },
      payload: { name: newName }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.message).toBe('User updated successfully');
    expect(body.data.name).toBe(newName);
    expect(body.data.user_id).toBe(testUser.user_id);
  });

  it('should update user email', async () => {
    const testUser = await createTestUser();
    const newEmail = faker.internet.email();
    const response = await app.inject({
      method: 'PUT',
      url: `/api/admin/user/${testUser.user_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`,
        'Content-Type': 'application/json'
      },
      payload: { email: newEmail }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.email).toBe(newEmail);
  });

  it('should update user role', async () => {
    const testUser = await createTestUser();
    const response = await app.inject({
      method: 'PUT',
      url: `/api/admin/user/${testUser.user_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`,
        'Content-Type': 'application/json'
      },
      payload: { role: Role.LIBRARIAN }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.role).toBe(Role.LIBRARIAN);
  });

  it('should return 409 when email is already in use', async () => {
    const testUser = await createTestUser();
    const response = await app.inject({
      method: 'PUT',
      url: `/api/admin/user/${testUser.user_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`,
        'Content-Type': 'application/json'
      },
      payload: { email: users[1].email }
    });

    expect(response.statusCode).toBe(409);
    const body = response.json();
    expect(body.error).toBe('Conflict');
  });

  it('should update user password', async () => {
    const testUser = await createTestUser();
    const newPassword = 'newPassword123';

    const response = await app.inject({
      method: 'PUT',
      url: `/api/admin/user/${testUser.user_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`,
        'Content-Type': 'application/json'
      },
      payload: { password: newPassword }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.message).toBe('User updated successfully');

    // Verify the user can sign in with new password
    const signInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: testUser.email,
        password: newPassword
      }
    });

    expect(signInResponse.statusCode).toBe(200);
  });

  it('should update multiple fields at once', async () => {
    const testUser = await createTestUser();
    const updateData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: Role.ADMIN
    };

    const response = await app.inject({
      method: 'PUT',
      url: `/api/admin/user/${testUser.user_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`,
        'Content-Type': 'application/json'
      },
      payload: updateData
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.name).toBe(updateData.name);
    expect(body.data.email).toBe(updateData.email);
    expect(body.data.role).toBe(updateData.role);
  });

  it('should validate email format', async () => {
    const testUser = await createTestUser();
    const response = await app.inject({
      method: 'PUT',
      url: `/api/admin/user/${testUser.user_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`,
        'Content-Type': 'application/json'
      },
      payload: { email: 'invalid-email' }
    });

    expect(response.statusCode).toBe(400);
  });

  it('should validate password length', async () => {
    const testUser = await createTestUser();
    const response = await app.inject({
      method: 'PUT',
      url: `/api/admin/user/${testUser.user_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`,
        'Content-Type': 'application/json'
      },
      payload: { password: '123' }
    });

    expect(response.statusCode).toBe(400);
  });

  it('should validate name length', async () => {
    const testUser = await createTestUser();
    const response = await app.inject({
      method: 'PUT',
      url: `/api/admin/user/${testUser.user_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`,
        'Content-Type': 'application/json'
      },
      payload: { name: '' }
    });

    expect(response.statusCode).toBe(400);
  });

  it('should prevent changing role of admin user', async () => {
    const adminUser = await createTestUser(Role.ADMIN);

    const response = await app.inject({
      method: 'PUT',
      url: `/api/admin/user/${adminUser.user_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`,
        'Content-Type': 'application/json'
      },
      payload: { role: Role.MEMBER }
    });

    expect(response.statusCode).toBe(403);
    const body = response.json();
    expect(body.error).toBe('Forbidden');
    expect(body.message).toContain('Cannot change role of admin users');
  });

  it('should allow updating other fields of admin user', async () => {
    const adminUser = await createTestUser(Role.ADMIN);
    const newName = faker.person.fullName();
    const response = await app.inject({
      method: 'PUT',
      url: `/api/admin/user/${adminUser.user_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`,
        'Content-Type': 'application/json'
      },
      payload: { name: newName }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.name).toBe(newName);
    expect(body.data.role).toBe(Role.ADMIN);
  });

  it('should invalidate tokens when role is changed', async () => {
    const testUser = await createTestUser();

    // First, get a fresh access token for the test user
    const signinResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: testUser.email,
        password: testUser.password
      }
    });
    const signinBody = signinResponse.json();
    const oldAccessToken = signinBody.data.access_token;

    // Verify the token works
    const verifyOldTokenResponse = await app.inject({
      method: 'GET',
      url: '/api/user/me',
      headers: { Authorization: `Bearer ${oldAccessToken}` }
    });
    expect(verifyOldTokenResponse.statusCode).toBe(200);

    // Change the user's role
    const response = await app.inject({
      method: 'PUT',
      url: `/api/admin/user/${testUser.user_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`,
        'Content-Type': 'application/json'
      },
      payload: { role: Role.LIBRARIAN }
    });

    expect(response.statusCode).toBe(200);

    // Try to use the old token - should fail
    const verifyInvalidatedTokenResponse = await app.inject({
      method: 'GET',
      url: '/api/user/me',
      headers: { Authorization: `Bearer ${oldAccessToken}` }
    });
    expect(verifyInvalidatedTokenResponse.statusCode).toBe(401);
  });
});
