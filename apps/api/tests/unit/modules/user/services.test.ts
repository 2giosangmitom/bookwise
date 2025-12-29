import UserService from '@/modules/user/services';
import { Role } from '@/generated/prisma/enums';
import type { User } from '@/generated/prisma/client';
import { faker } from '@faker-js/faker';
import { buildMockFastify } from '../../helpers/mockFastify';
import { HttpError } from '@fastify/sensible';
import * as hashUtils from '@/utils/hash';

describe('UserService', async () => {
  const app = await buildMockFastify();
  const userService = new UserService({ prisma: app.prisma });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should throw not found error if user does not exist', async () => {
      const userId = faker.string.uuid();

      // Mock no user found
      vi.spyOn(app.prisma.user, 'findUnique').mockResolvedValueOnce(null);

      await expect(userService.getUserById(userId)).rejects.toThrow(HttpError);
      expect(app.httpErrors.notFound).toHaveBeenCalledWith('User not found');
    });

    it('should return user data when user exists', async () => {
      const userId = faker.string.uuid();
      const mockUser = {
        user_id: userId,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: Role.MEMBER,
        password_hash: 'hashed_password',
        salt: 'salt_value',
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      };

      // Mock user found
      vi.spyOn(app.prisma.user, 'findUnique').mockResolvedValueOnce(mockUser);

      const result = await userService.getUserById(userId);

      expect(result).toEqual(mockUser);
      expect(app.prisma.user.findUnique).toHaveBeenCalledExactlyOnceWith({
        where: { user_id: userId },
        select: {
          user_id: true,
          name: true,
          email: true,
          role: true,
          created_at: true,
          updated_at: true
        }
      });
    });

    it('should exclude sensitive fields like password_hash and salt', async () => {
      const userId = faker.string.uuid();
      const mockUser = {
        user_id: userId,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: Role.MEMBER,
        password_hash: 'hashed_password',
        salt: 'salt_value',
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      };

      vi.spyOn(app.prisma.user, 'findUnique').mockResolvedValueOnce(mockUser);

      await userService.getUserById(userId);

      // Verify that the select option excludes sensitive fields
      expect(app.prisma.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: userId },
        select: expect.not.objectContaining({
          password_hash: expect.anything(),
          salt: expect.anything()
        })
      });
    });
  });

  describe('changePassword', () => {
    it('should throw not found error if user does not exist', async () => {
      const userId = faker.string.uuid();
      const currentPassword = faker.internet.password();
      const newPassword = faker.internet.password();

      vi.spyOn(app.prisma.user, 'findUnique').mockResolvedValueOnce(null);

      await expect(userService.changePassword(userId, currentPassword, newPassword)).rejects.toThrow(HttpError);
      expect(app.httpErrors.notFound).toHaveBeenCalledWith('User not found');
    });

    it('should throw unauthorized error if current password is incorrect', async () => {
      const userId = faker.string.uuid();
      const currentPassword = 'wrongpassword';
      const newPassword = faker.internet.password();

      const mockUser = {
        user_id: userId,
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: Role.MEMBER,
        password_hash: 'hashed_password',
        salt: 'salt_value',
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      };

      vi.spyOn(app.prisma.user, 'findUnique').mockResolvedValueOnce(mockUser);
      vi.spyOn(hashUtils, 'verifyHash').mockResolvedValueOnce(false);

      await expect(userService.changePassword(userId, currentPassword, newPassword)).rejects.toThrow(HttpError);
      expect(app.httpErrors.unauthorized).toHaveBeenCalledWith('Current password is incorrect');
    });

    it('should successfully change password with correct current password', async () => {
      const userId = faker.string.uuid();
      const currentPassword = 'currentPassword123';
      const newPassword = 'newPassword456';

      const mockUser = {
        user_id: userId,
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: Role.MEMBER,
        password_hash: 'old_hashed_password',
        salt: 'old_salt_value',
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      };

      const newHashResult = {
        hash: 'new_hashed_password',
        salt: 'new_salt_value'
      };

      vi.spyOn(app.prisma.user, 'findUnique').mockResolvedValueOnce(mockUser);
      vi.spyOn(hashUtils, 'verifyHash').mockResolvedValueOnce(true);
      vi.spyOn(hashUtils, 'generateHash').mockResolvedValueOnce(newHashResult);
      vi.spyOn(app.prisma.user, 'update').mockResolvedValueOnce({} as User);

      await userService.changePassword(userId, currentPassword, newPassword);

      expect(hashUtils.verifyHash).toHaveBeenCalledWith(currentPassword, mockUser.password_hash, mockUser.salt);
      expect(hashUtils.generateHash).toHaveBeenCalledWith(newPassword);
      expect(app.prisma.user.update).toHaveBeenCalledWith({
        where: { user_id: userId },
        data: {
          password_hash: newHashResult.hash,
          salt: newHashResult.salt
        }
      });
    });

    it('should fetch user with password_hash and salt fields', async () => {
      const userId = faker.string.uuid();
      const currentPassword = 'password123';
      const newPassword = 'newPassword456';

      const mockUser = {
        user_id: userId,
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: Role.MEMBER,
        password_hash: 'hashed_password',
        salt: 'salt_value',
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      };

      vi.spyOn(app.prisma.user, 'findUnique').mockResolvedValueOnce(mockUser);
      vi.spyOn(hashUtils, 'verifyHash').mockResolvedValueOnce(true);
      vi.spyOn(hashUtils, 'generateHash').mockResolvedValueOnce({ hash: 'new_hash', salt: 'new_salt' });
      vi.spyOn(app.prisma.user, 'update').mockResolvedValueOnce({} as User);

      await userService.changePassword(userId, currentPassword, newPassword);

      expect(app.prisma.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: userId },
        select: {
          user_id: true,
          password_hash: true,
          salt: true
        }
      });
    });
  });
});
