import type { PrismaClient } from '@/generated/prisma/client';
import { httpErrors } from '@fastify/sensible';
import { generateHash, verifyHash } from '@/utils/hash';

export default class UserService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  public async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
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

    if (!user) {
      throw httpErrors.notFound('User not found');
    }

    return user;
  }

  public async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Get user with password hash and salt
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        password_hash: true,
        salt: true
      }
    });

    if (!user) {
      throw httpErrors.notFound('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyHash(currentPassword, user.password_hash, user.salt);

    if (!isCurrentPasswordValid) {
      throw httpErrors.unauthorized('Current password is incorrect');
    }

    // Generate new hash for new password
    const { hash, salt } = await generateHash(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { user_id: userId },
      data: {
        password_hash: hash,
        salt
      }
    });
  }
}
