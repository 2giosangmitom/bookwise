import { JWTUtils } from '@/utils/jwt';
import { buildMockFastify } from '../helpers/mockFastify';
import { accessTokenExpiration, refreshTokenExpiration } from '@/constants';

describe('JWTUtils', async () => {
  const app = await buildMockFastify();
  const jwtUtils = JWTUtils.getInstance(app.redis);

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('storeRefreshToken', () => {
    it('should store refresh token and add to user set', async () => {
      const userId = 'user123';
      const refreshTokenId = 'refreshToken123';

      await jwtUtils.storeRefreshToken(userId, refreshTokenId);

      expect(app.redis.pipeline).toHaveBeenCalled();

      expect(app.redis.pipeline().set).toHaveBeenCalledWith(
        `refresh_token:${refreshTokenId}`,
        userId,
        'EX',
        refreshTokenExpiration
      );
      expect(app.redis.pipeline().sadd).toHaveBeenCalledWith(`user_refresh_tokens:${userId}`, refreshTokenId);
      expect(app.redis.pipeline().exec).toHaveBeenCalled();
    });
  });

  describe('storeAccessToken', () => {
    it('should store access token and add to user set', async () => {
      const userId = 'user123';
      const accessTokenId = 'accessToken123';
      const refreshTokenId = 'refreshToken123';

      await jwtUtils.storeAccessToken(userId, accessTokenId, refreshTokenId);

      expect(app.redis.pipeline).toHaveBeenCalled();

      expect(app.redis.pipeline().set).toHaveBeenCalledWith(
        `access_token:${accessTokenId}`,
        accessTokenId,
        'EX',
        accessTokenExpiration
      );
      expect(app.redis.pipeline().sadd).toHaveBeenCalledWith(
        `user_access_tokens:${userId}:${refreshTokenId}`,
        accessTokenId
      );
      expect(app.redis.pipeline().exec).toHaveBeenCalled();
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke refresh token and associated access tokens', async () => {
      const userId = 'user123';
      const refreshTokenId = 'refreshToken123';

      // Mock revokeAccessTokens to avoid testing its internals here
      const revokeAccessTokensSpy = vi.spyOn(jwtUtils, 'revokeAccessTokens').mockResolvedValueOnce(undefined);

      await jwtUtils.revokeRefreshToken(userId, refreshTokenId);

      expect(app.redis.pipeline).toHaveBeenCalled();

      expect(app.redis.pipeline().del).toHaveBeenCalledWith(`refresh_token:${refreshTokenId}`);
      expect(app.redis.pipeline().srem).toHaveBeenCalledWith(`user_refresh_tokens:${userId}`, refreshTokenId);
      expect(revokeAccessTokensSpy).toHaveBeenCalledWith(userId, refreshTokenId);
      expect(app.redis.pipeline().exec).toHaveBeenCalled();
    });
  });

  describe('revokeAccessTokens', () => {
    it('should revoke all access tokens associated with a refresh token', async () => {
      const userId = 'user123';
      const refreshTokenId = 'refreshToken123';

      // Mock smembers to return a list of access token IDs
      vi.mocked(app.redis.smembers).mockResolvedValueOnce(['accessToken1', 'accessToken2']);

      await jwtUtils.revokeAccessTokens(userId, refreshTokenId);

      expect(app.redis.pipeline).toHaveBeenCalled();

      expect(app.redis.smembers).toHaveBeenCalledWith(`user_access_tokens:${userId}:${refreshTokenId}`);
      expect(app.redis.pipeline().del).toHaveBeenCalledWith('access_token:accessToken1');
      expect(app.redis.pipeline().del).toHaveBeenCalledWith('access_token:accessToken2');
      expect(app.redis.pipeline().del).toHaveBeenCalledWith(`user_access_tokens:${userId}:${refreshTokenId}`);
      expect(app.redis.pipeline().exec).toHaveBeenCalled();
    });
  });

  describe('isTokenValid', () => {
    it('should return true if token exists', async () => {
      const tokenType = 'access_token';
      const tokenId = 'accessToken123';

      // Mock exists to return 1 (exists)
      vi.spyOn(app.redis, 'exists').mockResolvedValueOnce(1);

      const isValid = await jwtUtils.isTokenValid(tokenType, tokenId);

      expect(app.redis.exists).toHaveBeenCalledWith(`${tokenType}:${tokenId}`);
      expect(isValid).toBe(true);
    });

    it('should return false if token does not exist', async () => {
      const tokenType = 'access_token';
      const tokenId = 'accessToken123';

      // Mock exists to return 0 (does not exist)
      vi.mocked(app.redis.exists).mockResolvedValueOnce(0);

      const isValid = await jwtUtils.isTokenValid(tokenType, tokenId);

      expect(app.redis.exists).toHaveBeenCalledWith(`${tokenType}:${tokenId}`);
      expect(isValid).toBe(false);
    });
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple calls to getInstance', () => {
      const instance1 = JWTUtils.getInstance(app.redis);
      const instance2 = JWTUtils.getInstance(app.redis);

      expect(instance1).toBe(instance2);
    });
  });
});
