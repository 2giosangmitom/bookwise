import { type envType } from '@/config/envSchema';
import { fastifyJwt } from '@fastify/jwt';
import { JWTUtils } from '@/utils/jwt';
import fp from 'fastify-plugin';
import { accessTokenExpiration } from '@/constants';
import { asFunction } from 'awilix';

export default fp(
  async (fastify: FastifyTypeBox, opts: envType) => {
    fastify.log.debug('Registering JWT plugin');

    // Register JWTUtils factory in the Awilix container
    // This allows proper injection with the Redis client
    fastify.diContainer.register({
      jwtUtils: asFunction(() => new JWTUtils(fastify.redis)).singleton()
    });

    // Resolve and decorate for convenience
    const jwtUtils = fastify.diContainer.resolve<JWTUtils>('jwtUtils');
    fastify.decorate('jwtUtils', jwtUtils);

    await fastify.register(fastifyJwt, {
      secret: opts.JWT_SECRET,
      sign: {
        expiresIn: accessTokenExpiration
      },
      trusted: async (_, decodedToken) => {
        return jwtUtils.isTokenValid(decodedToken.typ, decodedToken.jti);
      },
      cookie: {
        cookieName: 'refreshToken',
        signed: true
      }
    });
  },
  {
    name: 'JWT',
    dependencies: ['Redis', 'Cookie', 'Awilix']
  }
);

declare module 'fastify' {
  interface FastifyInstance {
    jwtUtils: JWTUtils;
  }
}
