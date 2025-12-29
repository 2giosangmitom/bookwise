import { addRouteTags } from '@/hooks/onRoute';

export default function ratingHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Rating'));
}
