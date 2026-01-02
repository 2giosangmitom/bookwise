import { type FastifyRedis } from '@fastify/redis';
import { accessTokenExpiration, refreshTokenExpiration } from '@/constants';

export class JWTUtils {
  private static instance: JWTUtils | null = null;
  private redisClient: FastifyRedis;

  private constructor(redisClient: FastifyRedis) {
    this.redisClient = redisClient;
  }

  public static getInstance(redisClient: FastifyRedis): JWTUtils {
    if (!JWTUtils.instance) {
      JWTUtils.instance = new JWTUtils(redisClient);
    }
    return JWTUtils.instance;
  }

  public async storeRefreshToken(userId: string, refreshTokenId: string) {
    const pipeline = this.redisClient.pipeline();

    // Store the refresh token with an expiration time
    const stringKey = `refresh_token:${refreshTokenId}`;
    pipeline.set(stringKey, userId, 'EX', refreshTokenExpiration);

    // Membership set to track all refresh tokens for the user
    const setKey = `user_refresh_tokens:${userId}`;
    pipeline.sadd(setKey, refreshTokenId);

    await pipeline.exec();
  }

  public async storeAccessToken(userId: string, accessTokenId: string, refreshTokenId: string) {
    const pipeline = this.redisClient.pipeline();

    const stringKey = `access_token:${accessTokenId}`;
    pipeline.set(stringKey, accessTokenId, 'EX', accessTokenExpiration);

    // Membership set to track all access tokens for the user
    const setKey = `user_access_tokens:${userId}:${refreshTokenId}`;
    pipeline.sadd(setKey, accessTokenId);

    await pipeline.exec();
  }

  public async revokeRefreshToken(userId: string, refreshTokenId: string) {
    const pipeline = this.redisClient.pipeline();

    const stringKey = `refresh_token:${refreshTokenId}`;
    pipeline.del(stringKey);

    const setKey = `user_refresh_tokens:${userId}`;
    pipeline.srem(setKey, refreshTokenId);

    // Also revoke all associated access tokens
    await this.revokeAccessTokens(userId, refreshTokenId);

    await pipeline.exec();
  }

  public async revokeAccessTokens(userId: string, refreshTokenId: string) {
    const pipeline = this.redisClient.pipeline();

    const setKey = `user_access_tokens:${userId}:${refreshTokenId}`;
    const accessTokenIds = await this.redisClient.smembers(setKey);
    accessTokenIds.forEach((accessTokenId) => {
      const accessTokenKey = `access_token:${accessTokenId}`;
      pipeline.del(accessTokenKey);
    });
    pipeline.del(setKey);

    await pipeline.exec();
  }

  public async revokeAllUserTokens(userId: string) {
    const pipeline = this.redisClient.pipeline();

    // Get all refresh tokens for the user
    const refreshTokensSetKey = `user_refresh_tokens:${userId}`;
    const refreshTokenIds = await this.redisClient.smembers(refreshTokensSetKey);

    // Delete only access tokens (not refresh tokens)
    // Access tokens contain role data, refresh tokens don't
    for (const refreshTokenId of refreshTokenIds) {
      // Delete all access tokens for this refresh token
      const accessTokensSetKey = `user_access_tokens:${userId}:${refreshTokenId}`;
      const accessTokenIds = await this.redisClient.smembers(accessTokensSetKey);
      accessTokenIds.forEach((accessTokenId) => {
        const accessTokenKey = `access_token:${accessTokenId}`;
        pipeline.del(accessTokenKey);
      });
      pipeline.del(accessTokensSetKey);
    }

    await pipeline.exec();
  }

  public async isTokenValid(tokenType: TokenType, tokenId: string): Promise<boolean> {
    const stringKey = `${tokenType}:${tokenId}`;
    const exists = await this.redisClient.exists(stringKey);
    return exists === 1;
  }
}
