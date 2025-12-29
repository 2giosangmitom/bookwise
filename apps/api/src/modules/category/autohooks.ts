import { addRouteTags } from '@/hooks/onRoute';

export default function categoryHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Category'));
}
