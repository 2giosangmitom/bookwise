import fp from 'fastify-plugin';
import { fastifyAwilixPlugin } from '@fastify/awilix';

export default fp(
  async (fastify) => {
    fastify.log.debug('Registering Awilix plugin');

    fastify.register(fastifyAwilixPlugin, {
      strictBooleanEnforced: true
    });
  },
  {
    name: 'Awilix'
  }
);
