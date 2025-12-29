import { addRouteTags } from '@/hooks/onRoute';
import { asClass } from 'awilix';
import StaffLocationService from './services';
import StaffLocationController from './controllers';

export default function staffLocationHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Staff/Location'));

  fastify.diContainer.register({
    staffLocationService: asClass(StaffLocationService).singleton(),
    staffLocationController: asClass(StaffLocationController).singleton()
  });
}
