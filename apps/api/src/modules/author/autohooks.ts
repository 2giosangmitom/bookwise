import { addRouteTags } from '@/hooks/onRoute';

export default function authorHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Author'));
}
