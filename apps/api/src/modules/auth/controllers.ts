import { RefreshTokenSchema, SignInSchema, SignOutSchema, SignUpSchema } from './schemas';
import { refreshTokenExpiration } from '@/constants';
import { nanoid } from 'nanoid';
import type AuthService from './services';
import type { PrismaClient } from '@/generated/prisma/client';
import { httpErrors } from '@fastify/sensible';

export default class AuthController {
  private authService: AuthService;
  private prisma: PrismaClient;

  public constructor({ authService, prisma }: { authService: AuthService; prisma: PrismaClient }) {
    this.authService = authService;
    this.prisma = prisma;
  }

  public async signUp(
    req: FastifyRequestTypeBox<typeof SignUpSchema>,
    reply: FastifyReplyTypeBox<typeof SignUpSchema>
  ) {
    const { email, password, fullName } = req.body;

    const user = await this.authService.createUserAccount({ email, password, fullName, role: 'MEMBER' });

    return reply.status(201).send({
      message: 'User account created successfully',
      data: {
        ...user,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString()
      }
    });
  }

  public async signIn(
    req: FastifyRequestTypeBox<typeof SignInSchema>,
    reply: FastifyReplyTypeBox<typeof SignInSchema>
  ) {
    const validateResult = await this.authService.validateUserCredentials(req.body);

    const accessToken = await reply.jwtSign({
      typ: 'access_token',
      sub: validateResult.user.user_id,
      role: validateResult.user.role,
      jti: validateResult.accessTokenJwtId
    } satisfies AccessToken);

    const refreshToken = await reply.jwtSign(
      {
        typ: 'refresh_token',
        sub: validateResult.user.user_id,
        jti: validateResult.refreshTokenJwtId
      } satisfies RefreshToken,
      {
        expiresIn: refreshTokenExpiration
      }
    );

    return reply
      .setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/',
        maxAge: refreshTokenExpiration,
        sameSite: 'none',
        secure: true,
        signed: true
      })
      .status(200)
      .send({
        message: 'User signed in successfully',
        data: {
          access_token: accessToken
        }
      });
  }

  public async refreshToken(
    req: FastifyRequestTypeBox<typeof RefreshTokenSchema>,
    reply: FastifyReplyTypeBox<typeof RefreshTokenSchema>
  ) {
    try {
      const data = await req.jwtVerify<RefreshToken>({ onlyCookie: true });

      const newAccessTokenJwtId = nanoid();
      const { role } = await this.prisma.user.findUniqueOrThrow({
        where: { user_id: data.sub },
        select: { role: true }
      });

      await this.authService.storeAccessToken(data.sub, newAccessTokenJwtId, data.jti);
      const newAccessToken = await reply.jwtSign({
        typ: 'access_token',
        sub: data.sub,
        jti: newAccessTokenJwtId,
        role
      } satisfies AccessToken);

      return reply.status(200).send({
        message: 'Access token refreshed successfully',
        data: {
          access_token: newAccessToken
        }
      });
    } catch (error) {
      throw httpErrors.unauthorized(error instanceof Error ? error.message : 'Invalid refresh token');
    }
  }

  public async signOut(
    req: FastifyRequestTypeBox<typeof SignOutSchema>,
    reply: FastifyReplyTypeBox<typeof SignOutSchema>
  ) {
    try {
      const data = await req.jwtVerify<RefreshToken>({ onlyCookie: true });
      await this.authService.revokeUserRefreshToken(data.sub, data.jti);
    } catch {
      // Even if the refresh token is invalid, we still clear the cookie to sign the user out
    }

    return reply
      .clearCookie('refreshToken', {
        httpOnly: true,
        path: '/',
        maxAge: refreshTokenExpiration,
        sameSite: 'none',
        secure: true,
        signed: true
      })
      .status(200)
      .send({
        message: 'User signed out successfully'
      });
  }
}
