import { addRouteTags } from '@/hooks/onRoute';
import { asClass } from 'awilix';
import StaffPublisherService from './services';
import StaffPublisherController from './controllers';

export default function staffPublisherHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Staff/Publisher'));

  fastify.diContainer.register({
    staffPublisherService: asClass(StaffPublisherService).singleton(),
    staffPublisherController: asClass(StaffPublisherController).singleton()
  });
}
