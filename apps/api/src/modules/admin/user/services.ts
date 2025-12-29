import { Prisma, PrismaClient } from '@/generated/prisma/client';
import type { Static } from 'typebox';
import { GetUsersSchema } from './schemas';

export default class AdminUserService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  public async getUsers(query: Static<typeof GetUsersSchema.querystring> & { page: number; limit: number }) {
    const filters: Prisma.UserWhereInput = {};

    if (query.email) {
      filters.email = { contains: query.email, mode: 'insensitive' };
    }

    if (query.name) {
      filters.name = { contains: query.name, mode: 'insensitive' };
    }

    if (query.role) {
      filters.role = query.role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: filters,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          user_id: true,
          name: true,
          email: true,
          role: true,
          created_at: true,
          updated_at: true
        }
      }),
      this.prisma.user.count({ where: filters })
    ]);

    return { users, total };
  }
}
