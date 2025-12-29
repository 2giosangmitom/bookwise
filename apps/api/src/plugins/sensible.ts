import fp from 'fastify-plugin';
import { fastifySensible } from '@fastify/sensible';

export default fp(
  async (fastify: FastifyTypeBox) => {
    fastify.log.debug('Registering sensible plugin');

    await fastify.register(fastifySensible, {
      sharedSchemaId: 'HttpError'
    });
  },
  {
    name: 'Sensible'
  }
);
