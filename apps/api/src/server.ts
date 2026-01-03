import { buildApp } from './app';
import closeWithGrace from 'close-with-grace';
import cron from 'node-cron';
import type { JWTUtils } from '@/utils/jwt';

async function main() {
  const app = await buildApp();

  // Close server gracefully
  closeWithGrace(async ({ err, signal }) => {
    if (err) {
      app.log.error({ err }, 'Server closing with error');
    } else {
      app.log.info(`${signal} received, server closing`);
    }
    await app.close();
  });

  app.ready(() => {
    app.log.debug('App routes:\n%s', app.printRoutes());
    app.log.debug('App plugins:\n%s', app.printPlugins());
  });

  app.listen({
    port: parseInt(process.env.FASTIFY_PORT ?? '8080'),
    host: process.env.FASTIFY_HOST ?? '127.0.0.1'
  });

  // Clean up dead access tokens and refresh tokens every 10 minutes
  cron.schedule('0 */10 * * * *', async () => {
    app.log.info('Running scheduled token cleanup task');
    const jwtUtils = app.diContainer.resolve<JWTUtils>('jwtUtils');

    // Clean up dead refresh tokens
    let cursor = '0';
    do {
      const [nextCursor, elements] = await app.redis.scan(cursor, 'MATCH', 'user_refresh_tokens:*', 'COUNT', '20');
      for (const setKey of elements) {
        const userId = setKey.split(':')[1];
        const refreshTokenIds = await app.redis.smembers(setKey);

        // If there are no refresh tokens, remove the set
        if (refreshTokenIds.length === 0) {
          await app.redis.del(setKey);
          continue;
        }

        // Check each refresh token for existence
        for (const refreshTokenId of refreshTokenIds) {
          const refreshTokenKey = `refresh_token:${refreshTokenId}`;
          const exists = await app.redis.exists(refreshTokenKey);
          // If the refresh token does not exist, remove it from the set
          if (exists === 0) {
            app.log.info(`Cleaning up dead refresh token ${refreshTokenId} for user ${userId}`);
            await jwtUtils.revokeRefreshToken(userId, refreshTokenId);
          }
        }
      }
      cursor = nextCursor;
    } while (cursor !== '0');

    // Clean up dead access tokens
    cursor = '0';
    do {
      const [nextCursor, elements] = await app.redis.scan(cursor, 'MATCH', 'user_access_tokens:*', 'COUNT', '20');
      for (const setKey of elements) {
        const parts = setKey.split(':');
        const userId = parts[1];
        const refreshTokenId = parts[2];
        const accessTokenIds = await app.redis.smembers(setKey);

        // If there are no access tokens, remove the set
        if (accessTokenIds.length === 0) {
          await app.redis.del(setKey);
          continue;
        }

        // Check each access token for existence
        for (const accessTokenId of accessTokenIds) {
          const accessTokenKey = `access_token:${accessTokenId}`;
          const exists = await app.redis.exists(accessTokenKey);
          // If the access token does not exist, remove it from the set
          if (exists === 0) {
            app.log.info(
              `Cleaning up dead access token ${accessTokenId} for user ${userId} and refresh token ${refreshTokenId}`
            );
            await app.redis.srem(setKey, accessTokenId);
          }
        }
      }
      cursor = nextCursor;
    } while (cursor !== '0');

    app.log.info('Token cleanup task completed');
  });
}

main().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
