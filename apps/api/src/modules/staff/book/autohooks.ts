import { addRouteTags } from '@/hooks/onRoute';
import { asClass } from 'awilix';
import StaffBookService from './services';
import StaffBookController from './controllers';

export default function staffBookHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Staff/Book'));

  fastify.diContainer.register({
    staffBookService: asClass(StaffBookService).singleton(),
    staffBookController: asClass(StaffBookController).singleton()
  });
}
