import { authHook, isAdminHook } from '@/hooks/auth';
import { addRouteTags } from '@/hooks/onRoute';

export default function adminHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Admin'));
  fastify.addHook('preHandler', authHook);
  fastify.addHook('preHandler', isAdminHook);
}
