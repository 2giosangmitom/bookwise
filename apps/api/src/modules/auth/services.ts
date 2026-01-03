import type { PrismaClient } from '@/generated/prisma/client';
import { Role } from '@/generated/prisma/enums';
import { generateHash, verifyHash } from '@/utils/hash';
import { JWTUtils } from '@/utils/jwt';
import { nanoid } from 'nanoid';
import { httpErrors } from '@fastify/sensible';

export default class AuthService {
  private jwtUtils: JWTUtils;
  private prisma: PrismaClient;

  public constructor({ jwtUtils, prisma }: { jwtUtils: JWTUtils; prisma: PrismaClient }) {
    this.jwtUtils = jwtUtils;
    this.prisma = prisma;
  }

  public async createUserAccount(data: { email: string; password: string; fullName: string; role: Role }) {
    const { email, password, fullName, role } = data;

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      throw httpErrors.conflict('Email is already in use');
    }

    const { hash, salt } = await generateHash(password);

    const user = await this.prisma.user.create({
      omit: { password_hash: true, salt: true },
      data: {
        email,
        password_hash: hash,
        salt,
        role,
        name: fullName
      }
    });

    return user;
  }

  public async validateUserCredentials(data: { email: string; password: string }) {
    const { email, password } = data;

    // Validate email
    const user = await this.prisma.user.findUnique({
      where: { email }
    });
    const invalidCredentialsError = httpErrors.unauthorized('Invalid credentials');

    if (!user) {
      throw invalidCredentialsError;
    }

    // Validate password
    const isPasswordValid = await verifyHash(password, user.password_hash, user.salt);

    if (!isPasswordValid) {
      throw invalidCredentialsError;
    }

    const refreshTokenJwtId = nanoid();
    const accessTokenJwtId = nanoid();

    const promises = [
      this.jwtUtils.storeRefreshToken(user.user_id, refreshTokenJwtId),
      this.jwtUtils.storeAccessToken(user.user_id, accessTokenJwtId, refreshTokenJwtId)
    ];
    await Promise.all(promises);

    return { user, refreshTokenJwtId, accessTokenJwtId };
  }

  public async storeAccessToken(userId: string, accessTokenId: string, refreshTokenId: string) {
    await this.jwtUtils.storeAccessToken(userId, accessTokenId, refreshTokenId);
  }

  public async revokeUserRefreshToken(userId: string, refreshTokenId: string) {
    await this.jwtUtils.revokeRefreshToken(userId, refreshTokenId);
  }

  public async getUserRole(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      select: { role: true }
    });

    if (!user) {
      throw httpErrors.notFound('User not found');
    }

    return user.role;
  }

  public async refreshAccessToken(userId: string, oldRefreshTokenJwtId: string) {
    const role = await this.getUserRole(userId);
    const newAccessTokenJwtId = nanoid();

    await this.storeAccessToken(userId, newAccessTokenJwtId, oldRefreshTokenJwtId);

    return { role, newAccessTokenJwtId };
  }
}
