import { addRouteTags } from '@/hooks/onRoute';

export default function publisherHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Publisher'));
}
