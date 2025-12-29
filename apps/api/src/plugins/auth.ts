import fp from 'fastify-plugin';
import { fastifyAuth } from '@fastify/auth';

export default fp(
  async (fastify) => {
    fastify.log.debug('Registering auth plugin');

    fastify.register(fastifyAuth);
  },
  {
    name: 'Auth'
  }
);
