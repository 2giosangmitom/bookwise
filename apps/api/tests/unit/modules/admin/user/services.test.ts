import AdminUserService from '@/modules/admin/user/services';
import { buildMockFastify } from '../../../helpers/mockFastify';
import { faker } from '@faker-js/faker';
import { Role } from '@/generated/prisma/enums';
import * as hashUtils from '@/utils/hash';
import { JWTUtils } from '@/utils/jwt';

const buildQuery = () => ({
  page: 1,
  limit: 10,
  searchTerm: faker.person.fullName(),
  role: Role.MEMBER
});

describe('AdminUserService', async () => {
  const app = await buildMockFastify();
  const service = new AdminUserService({ prisma: app.prisma, jwtUtils: JWTUtils.getInstance(app.redis) });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should call prisma.user.findMany with filters and pagination', async () => {
      const query = buildQuery();

      await service.getUsers(query);

      expect(app.prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { email: { contains: query.searchTerm, mode: 'insensitive' } },
              { name: { contains: query.searchTerm, mode: 'insensitive' } }
            ],
            role: query.role
          }),
          skip: (query.page - 1) * query.limit,
          take: query.limit
        })
      );

      expect(app.prisma.user.count).toHaveBeenCalledWith({ where: expect.any(Object) });
    });

    it('should return users and total', async () => {
      const query = buildQuery();
      const users = [
        {
          user_id: faker.string.uuid(),
          email: faker.internet.email(),
          name: faker.person.fullName(),
          role: Role.ADMIN,
          created_at: faker.date.anytime(),
          updated_at: faker.date.anytime()
        }
      ];
      const total = 1;

      vi.mocked(app.prisma.user.findMany).mockResolvedValueOnce(
        users as Awaited<ReturnType<typeof app.prisma.user.findMany>>
      );
      vi.mocked(app.prisma.user.count).mockResolvedValueOnce(total);

      const result = await service.getUsers(query);

      expect(result).toEqual({ users, total });
    });
  });

  describe('updateUser', () => {
    const userId = faker.string.uuid();
    const existingUser = {
      user_id: userId,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: Role.MEMBER,
      password_hash: faker.string.alphanumeric(60),
      salt: faker.string.alphanumeric(32),
      created_at: faker.date.anytime(),
      updated_at: faker.date.anytime()
    };

    it('should throw 404 error when user does not exist', async () => {
      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(null);

      await expect(service.updateUser(userId, { name: 'New Name' })).rejects.toThrow('User not found');
    });

    it('should throw 409 error when email is already in use', async () => {
      const newEmail = faker.internet.email();
      vi.mocked(app.prisma.user.findUnique)
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce({ ...existingUser, user_id: faker.string.uuid(), email: newEmail });

      await expect(service.updateUser(userId, { email: newEmail })).rejects.toThrow('Email already in use');
    });

    it('should update user name', async () => {
      const newName = faker.person.fullName();
      const updatedUser = { ...existingUser, name: newName };

      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(existingUser);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(app.prisma.user.update).mockResolvedValueOnce(updatedUser as any);

      const result = await service.updateUser(userId, { name: newName });

      expect(app.prisma.user.update).toHaveBeenCalledWith({
        where: { user_id: userId },
        data: { name: newName },
        select: expect.any(Object)
      });
      expect(result.name).toBe(newName);
    });

    it('should update user email', async () => {
      const newEmail = faker.internet.email();
      const updatedUser = { ...existingUser, email: newEmail };

      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(existingUser).mockResolvedValueOnce(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(app.prisma.user.update).mockResolvedValueOnce(updatedUser as any);

      const result = await service.updateUser(userId, { email: newEmail });

      expect(app.prisma.user.update).toHaveBeenCalledWith({
        where: { user_id: userId },
        data: { email: newEmail },
        select: expect.any(Object)
      });
      expect(result.email).toBe(newEmail);
    });

    it('should update user role', async () => {
      const newRole = Role.LIBRARIAN;
      const updatedUser = { ...existingUser, role: newRole };

      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(existingUser);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(app.prisma.user.update).mockResolvedValueOnce(updatedUser as any);

      const result = await service.updateUser(userId, { role: newRole });

      expect(app.prisma.user.update).toHaveBeenCalledWith({
        where: { user_id: userId },
        data: { role: newRole },
        select: expect.any(Object)
      });
      expect(result.role).toBe(newRole);
    });

    it('should update user password', async () => {
      const newPassword = 'newPassword123';
      const mockHash = 'hashedPassword';
      const mockSalt = 'salt123';

      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(existingUser);
      vi.spyOn(hashUtils, 'generateHash').mockResolvedValueOnce({ hash: mockHash, salt: mockSalt });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(app.prisma.user.update).mockResolvedValueOnce(existingUser as any);

      await service.updateUser(userId, { password: newPassword });

      expect(hashUtils.generateHash).toHaveBeenCalledWith(newPassword);
      expect(app.prisma.user.update).toHaveBeenCalledWith({
        where: { user_id: userId },
        data: { password_hash: mockHash, salt: mockSalt },
        select: expect.any(Object)
      });
    });

    it('should update multiple fields at once', async () => {
      const updateData = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: Role.LIBRARIAN
      };
      const updatedUser = { ...existingUser, ...updateData };

      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(existingUser).mockResolvedValueOnce(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(app.prisma.user.update).mockResolvedValueOnce(updatedUser as any);

      const result = await service.updateUser(userId, updateData);

      expect(app.prisma.user.update).toHaveBeenCalledWith({
        where: { user_id: userId },
        data: updateData,
        select: expect.any(Object)
      });
      expect(result.name).toBe(updateData.name);
      expect(result.email).toBe(updateData.email);
      expect(result.role).toBe(updateData.role);
    });

    it('should throw 403 error when trying to change role of admin user', async () => {
      const adminUser = { ...existingUser, role: Role.ADMIN };
      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(adminUser);

      await expect(service.updateUser(userId, { role: Role.MEMBER })).rejects.toThrow(
        'Cannot change role of admin users'
      );
    });

    it('should allow updating other fields of admin user', async () => {
      const adminUser = { ...existingUser, role: Role.ADMIN };
      const newName = faker.person.fullName();
      const updatedUser = { ...adminUser, name: newName };

      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(adminUser);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(app.prisma.user.update).mockResolvedValueOnce(updatedUser as any);

      const result = await service.updateUser(userId, { name: newName });

      expect(app.prisma.user.update).toHaveBeenCalled();
      expect(result.name).toBe(newName);
      expect(result.role).toBe(Role.ADMIN);
    });

    it('should invalidate all tokens when role is changed', async () => {
      const newRole = Role.LIBRARIAN;
      const updatedUser = { ...existingUser, role: newRole };

      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(existingUser);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(app.prisma.user.update).mockResolvedValueOnce(updatedUser as any);
      vi.spyOn(app.jwtUtils, 'revokeAllUserTokens').mockResolvedValueOnce(undefined);

      await service.updateUser(userId, { role: newRole });

      expect(app.jwtUtils.revokeAllUserTokens).toHaveBeenCalledWith(userId);
    });

    it('should not invalidate tokens when role is not changed', async () => {
      const newName = faker.person.fullName();
      const updatedUser = { ...existingUser, name: newName };

      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(existingUser);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(app.prisma.user.update).mockResolvedValueOnce(updatedUser as any);
      vi.spyOn(app.jwtUtils, 'revokeAllUserTokens').mockResolvedValueOnce(undefined);

      await service.updateUser(userId, { name: newName });

      expect(app.jwtUtils.revokeAllUserTokens).not.toHaveBeenCalled();
    });
  });
});
