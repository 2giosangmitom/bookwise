import { Role } from '@/generated/prisma/enums';
import { buildMockFastify } from '../helpers/mockFastify';
import { authHook, isLibrarianHook, isAdminHook, isAdminOrLibrarianHook } from '@/hooks/auth';

describe('auth hooks', async () => {
  const app = await buildMockFastify();

  beforeAll(async () => {
    app.get('/protected', { preHandler: [authHook] }, async () => {
      return { message: 'Access granted' };
    });

    app.get('/librarian-only', { preHandler: [authHook, isLibrarianHook] }, async () => {
      return { message: 'Librarian access granted' };
    });

    app.get('/admin-only', { preHandler: [authHook, isAdminHook] }, async () => {
      return { message: 'Admin access granted' };
    });

    app.get(
      '/admin-or-librarian',
      {
        preHandler: isAdminOrLibrarianHook(app)
      },
      async () => {
        return { message: 'Admin or Librarian access granted' };
      }
    );
  });

  beforeEach(() => {
    vi.mocked(app.redis.exists).mockResolvedValue(1);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('authHook', () => {
    it('should verify JWT token successfully', async () => {
      const token = app.jwt.sign({ role: Role.MEMBER });
      const response = await app.inject({
        path: '/protected',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ message: 'Access granted' });
    });

    it('should fail verification with invalid token', async () => {
      const response = await app.inject({
        path: '/protected',
        headers: {
          Authorization: 'Bearer invalidtoken'
        }
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchInlineSnapshot(`
        {
          "code": "FST_JWT_AUTHORIZATION_TOKEN_INVALID",
          "error": "Unauthorized",
          "message": "Authorization token is invalid: The token is malformed.",
          "statusCode": 401,
        }
      `);
    });

    it('should fail verification with missing token', async () => {
      const response = await app.inject({
        path: '/protected'
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchInlineSnapshot(`
        {
          "code": "FST_JWT_NO_AUTHORIZATION_IN_COOKIE",
          "error": "Unauthorized",
          "message": "No Authorization was found in request.cookies",
          "statusCode": 401,
        }
      `);
    });

    it('should fail verification with revoked token', async () => {
      vi.mocked(app.redis.exists).mockResolvedValue(0);

      const token = app.jwt.sign({ role: Role.MEMBER });
      const response = await app.inject({
        path: '/protected',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchInlineSnapshot(`
        {
          "code": "FST_JWT_AUTHORIZATION_TOKEN_UNTRUSTED",
          "error": "Unauthorized",
          "message": "Untrusted authorization token",
          "statusCode": 401,
        }
      `);
    });
  });

  describe('isLibrarianHook', () => {
    it('should allow access for LIBRARIAN role', async () => {
      const token = app.jwt.sign({ role: Role.LIBRARIAN });
      const response = await app.inject({
        path: '/librarian-only',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ message: 'Librarian access granted' });
    });

    it('should deny access for MEMBER role', async () => {
      const token = app.jwt.sign({ role: Role.MEMBER });
      const response = await app.inject({
        path: '/librarian-only',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchInlineSnapshot(`
        {
          "error": "Forbidden",
          "message": "Librarian access required",
          "statusCode": 403,
        }
      `);
    });

    it('should deny access for ADMIN role', async () => {
      const token = app.jwt.sign({ role: Role.ADMIN });
      const response = await app.inject({
        path: '/librarian-only',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchInlineSnapshot(`
        {
          "error": "Forbidden",
          "message": "Librarian access required",
          "statusCode": 403,
        }
      `);
    });
  });

  describe('isAdminHook', () => {
    it('should allow access for ADMIN role', async () => {
      const token = app.jwt.sign({ role: Role.ADMIN });
      const response = await app.inject({
        path: '/admin-only',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ message: 'Admin access granted' });
    });

    it('should deny access for MEMBER role', async () => {
      const token = app.jwt.sign({ role: Role.MEMBER });
      const response = await app.inject({
        path: '/admin-only',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchInlineSnapshot(`
        {
          "error": "Forbidden",
          "message": "Admin access required",
          "statusCode": 403,
        }
      `);
    });

    it('should deny access for LIBRARIAN role', async () => {
      const token = app.jwt.sign({ role: Role.LIBRARIAN });
      const response = await app.inject({
        path: '/admin-only',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchInlineSnapshot(`
        {
          "error": "Forbidden",
          "message": "Admin access required",
          "statusCode": 403,
        }
      `);
    });
  });

  describe('Admin or Librarian access', () => {
    it('should allow access for ADMIN role', async () => {
      const token = app.jwt.sign({ role: Role.ADMIN });
      const response = await app.inject({
        path: '/admin-or-librarian',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ message: 'Admin or Librarian access granted' });
    });

    it('should allow access for LIBRARIAN role', async () => {
      const token = app.jwt.sign({ role: Role.LIBRARIAN });
      const response = await app.inject({
        path: '/admin-or-librarian',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ message: 'Admin or Librarian access granted' });
    });

    it('should deny access for MEMBER role', async () => {
      const token = app.jwt.sign({ role: Role.MEMBER });
      const response = await app.inject({
        path: '/admin-or-librarian',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchInlineSnapshot(`
        {
          "error": "Forbidden",
          "message": "Admin or Librarian access required",
          "statusCode": 403,
        }
      `);
    });
  });
});
