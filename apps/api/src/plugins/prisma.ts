import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import fp from 'fastify-plugin';
import type { envType } from '@/config/envSchema';
import { asValue } from 'awilix';
import { diContainer } from '@fastify/awilix';

export default fp(
  (fastify: FastifyTypeBox, opts: envType) => {
    fastify.log.debug('Registering Prisma plugin');

    const adapter = new PrismaPg({ connectionString: opts.DATABASE_URL });
    const prisma = new PrismaClient({ adapter });
    fastify.decorate('prisma', prisma);

    // Register Prisma client in DI container
    diContainer.register({
      prisma: asValue(prisma)
    });

    fastify.addHook('onClose', async () => {
      await prisma.$disconnect();
    });
  },
  {
    name: 'Prisma',
    dependencies: ['Awilix']
  }
);

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
