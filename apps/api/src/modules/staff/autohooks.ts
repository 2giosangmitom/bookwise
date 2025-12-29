import { isAdminOrLibrarianHook } from '@/hooks/auth';

export default function staffHooks(fastify: FastifyTypeBox) {
  fastify.addHook('preHandler', isAdminOrLibrarianHook(fastify));
}
