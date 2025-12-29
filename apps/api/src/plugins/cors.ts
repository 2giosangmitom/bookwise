import { fastifyCors } from '@fastify/cors';
import { type envType } from '@/config/envSchema';
import fp from 'fastify-plugin';

export default fp(
  async (fastify: FastifyTypeBox, opts: envType) => {
    fastify.log.debug('Registering CORS plugin');

    await fastify.register(fastifyCors, {
      origin: opts.CORS_ORIGINS?.split(',') ?? [],
      methods: opts.CORS_METHODS?.split(',') ?? [],
      credentials: true
    });
  },
  {
    name: 'CORS'
  }
);
