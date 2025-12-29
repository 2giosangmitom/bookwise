import { addRouteTags } from '@/hooks/onRoute';
import { asClass } from 'awilix';
import StaffBookCloneService from './services';
import StaffBookCloneController from './controllers';

export default function staffBookCloneHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Staff/BookClone'));

  fastify.diContainer.register({
    staffBookCloneService: asClass(StaffBookCloneService).singleton(),
    staffBookCloneController: asClass(StaffBookCloneController).singleton()
  });
}
