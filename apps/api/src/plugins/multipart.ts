import fastifyMultipart from '@fastify/multipart';
import fp from 'fastify-plugin';

export default fp(
  async (fastify: FastifyTypeBox) => {
    fastify.log.debug('Registering Multipart plugin');

    await fastify.register(fastifyMultipart, {
      limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
      }
    });
  },
  {
    name: 'Multipart'
  }
);
