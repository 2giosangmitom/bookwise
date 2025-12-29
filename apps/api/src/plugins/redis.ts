import { type envType } from '@/config/envSchema';
import { fastifyRedis } from '@fastify/redis';
import fp from 'fastify-plugin';

export default fp(
  async (fastify: FastifyTypeBox, opts: envType) => {
    fastify.log.debug('Registering Redis plugin');

    await fastify.register(fastifyRedis, {
      url: opts.REDIS_URL
    });
  },
  {
    name: 'Redis'
  }
);
