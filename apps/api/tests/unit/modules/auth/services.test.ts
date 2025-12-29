import AuthService from '@/modules/auth/services';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';
import { buildMockFastify } from '../../helpers/mockFastify';
import { HttpError } from '@fastify/sensible';
import * as hashUtils from '@/utils/hash';
import { JWTUtils } from '@/utils/jwt';

describe('AuthService', async () => {
  const app = await buildMockFastify();
  const authService = new AuthService({ jwtUtils: JWTUtils.getInstance(app.redis), prisma: app.prisma });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('createUserAccount', () => {
    it('should throw conflict error if email already exists', async () => {
      // Mock existing user
      vi.spyOn(app.prisma.user, 'findUnique').mockResolvedValueOnce({
        user_id: faker.string.uuid(),
        email: faker.internet.email(),
        password_hash: 'hashedpassword',
        salt: 'salt',
        role: Role.MEMBER,
        name: faker.person.fullName(),
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      });

      await expect(
        authService.createUserAccount({
          email: faker.internet.email(),
          password: faker.internet.password(),
          fullName: faker.person.fullName(),
          role: Role.MEMBER
        })
      ).rejects.toThrow(HttpError);
      expect(app.httpErrors.conflict).toHaveBeenCalledWith('Email is already in use');
    });

    it('should call prisma.user.create with correct data', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const fullName = faker.person.fullName();
      const role = Role.MEMBER;

      // Mock no existing user
      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(null);

      await authService.createUserAccount({
        email,
        password,
        fullName,
        role
      });

      expect(app.prisma.user.create).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email,
            role,
            name: fullName
          })
        })
      );
    });

    it("should hash the user's password before storing", async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const fullName = faker.person.fullName();
      const role = Role.MEMBER;

      // Mock no existing user
      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(null);

      // Spy on hash generation
      const mockHashResult = {
        hash: faker.string.alphanumeric(64),
        salt: faker.string.alphanumeric(16)
      };
      vi.spyOn(hashUtils, 'generateHash').mockResolvedValueOnce(mockHashResult);

      await authService.createUserAccount({
        email,
        password,
        fullName,
        role
      });

      expect(hashUtils.generateHash).toHaveBeenCalledExactlyOnceWith(password);
      expect(app.prisma.user.create).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password_hash: mockHashResult.hash,
            salt: mockHashResult.salt
          })
        })
      );
    });
  });

  describe('validateUserCredentials', () => {
    it('should throw unauthorized error if email does not exist', async () => {
      // Mock no existing user
      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(null);

      await expect(
        authService.validateUserCredentials({
          email: faker.internet.email(),
          password: faker.internet.password()
        })
      ).rejects.toThrow(HttpError);
      expect(app.httpErrors.unauthorized).toHaveBeenCalledWith('Invalid credentials');
    });

    it('should throw unauthorized error if password is incorrect', async () => {
      const fakeUser = {
        user_id: faker.string.uuid(),
        email: faker.internet.email(),
        password_hash: 'hashedpassword',
        salt: 'salt',
        role: Role.MEMBER,
        name: faker.person.fullName(),
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      };

      // Mock existing user
      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(fakeUser);

      // Mock password verification to fail
      vi.spyOn(hashUtils, 'verifyHash').mockResolvedValueOnce(false);

      await expect(
        authService.validateUserCredentials({
          email: fakeUser.email,
          password: faker.internet.password()
        })
      ).rejects.toThrow(HttpError);
      expect(app.httpErrors.unauthorized).toHaveBeenCalledWith('Invalid credentials');
    });

    it('should return user and JWT IDs if credentials are valid', async () => {
      const fakeUser = {
        user_id: faker.string.uuid(),
        email: faker.internet.email(),
        password_hash: 'hashedpassword',
        salt: 'salt',
        role: Role.MEMBER,
        name: faker.person.fullName(),
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      };

      // Mock existing user
      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(fakeUser);

      // Mock password verification to succeed
      vi.spyOn(hashUtils, 'verifyHash').mockResolvedValueOnce(true);

      const result = await authService.validateUserCredentials({
        email: fakeUser.email,
        password: 'correctpassword'
      });

      expect(result).toHaveProperty('user', fakeUser);
      expect(result).toHaveProperty('accessTokenJwtId');
      expect(result).toHaveProperty('refreshTokenJwtId');
    });
  });
});
