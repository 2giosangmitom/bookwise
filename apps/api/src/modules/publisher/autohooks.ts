import { addRouteTags } from '@/hooks/onRoute';
import { asClass } from 'awilix';
import PublisherService from './services';
import PublisherController from './controllers';

export default function publisherHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Publisher'));

  fastify.diContainer.register({
    publisherService: asClass(PublisherService).singleton(),
    publisherController: asClass(PublisherController).singleton()
  });
}
