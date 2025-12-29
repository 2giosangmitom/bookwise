import { addRouteTags } from '@/hooks/onRoute';

export default function bookHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Book'));
}
