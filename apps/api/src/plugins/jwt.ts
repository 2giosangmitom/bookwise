import { type envType } from '@/config/envSchema';
import { fastifyJwt } from '@fastify/jwt';
import { JWTUtils } from '@/utils/jwt';
import fp from 'fastify-plugin';
import { accessTokenExpiration } from '@/constants';
import { asValue } from 'awilix';
import { diContainer } from '@fastify/awilix';

export default fp(
  async (fastify: FastifyTypeBox, opts: envType) => {
    fastify.log.debug('Registering JWT plugin');

    const jwtUtils = JWTUtils.getInstance(fastify.redis);
    fastify.decorate('jwtUtils', jwtUtils);
    diContainer.register({
      jwtUtils: asValue(jwtUtils)
    });

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
