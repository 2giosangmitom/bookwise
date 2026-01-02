import { Prisma, PrismaClient } from '@/generated/prisma/client';
import type { Static } from 'typebox';
import { GetUsersSchema, UpdateUserSchema } from './schemas';
import { httpErrors } from '@fastify/sensible';
import { generateHash } from '@/utils/hash';
import { JWTUtils } from '@/utils/jwt';

export default class AdminUserService {
  private prisma: PrismaClient;
  private jwtUtils: JWTUtils;

  public constructor({ prisma, jwtUtils }: { prisma: PrismaClient; jwtUtils: JWTUtils }) {
    this.prisma = prisma;
    this.jwtUtils = jwtUtils;
  }

  public async getUsers(query: Static<typeof GetUsersSchema.querystring> & { page: number; limit: number }) {
    const where: Prisma.UserWhereInput = {};

    if (query.searchTerm) {
      where.OR = [
        { email: { contains: query.searchTerm, mode: 'insensitive' } },
        { name: { contains: query.searchTerm, mode: 'insensitive' } }
      ];
    }

    if (query.role) {
      where.role = query.role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
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
      this.prisma.user.count({ where })
    ]);

    return { users, total };
  }

  public async updateUser(userId: string, data: Static<typeof UpdateUserSchema.body>) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { user_id: userId }
    });

    if (!existingUser) {
      throw httpErrors.notFound('User not found');
    }

    // Prevent changing role of admin users
    if (existingUser.role === 'ADMIN' && data.role !== undefined && data.role !== 'ADMIN') {
      throw httpErrors.forbidden('Cannot change role of admin users');
    }

    // Check if email is already taken by another user
    if (data.email && data.email !== existingUser.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: data.email }
      });

      if (emailTaken) {
        throw httpErrors.conflict('Email already in use');
      }
    }

    // Check if role is being changed
    const roleChanged = data.role !== undefined && data.role !== existingUser.role;

    // Prepare update data
    const updateData: Prisma.UserUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.email !== undefined) {
      updateData.email = data.email;
    }

    if (data.role !== undefined) {
      updateData.role = data.role;
    }

    // Handle password update
    if (data.password) {
      const { hash, salt } = await generateHash(data.password);
      updateData.password_hash = hash;
      updateData.salt = salt;
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { user_id: userId },
      data: updateData,
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    });

    // Invalidate all access tokens if role changed
    if (roleChanged) {
      await this.jwtUtils.revokeAllUserTokens(userId);
    }

    return updatedUser;
  }
}
