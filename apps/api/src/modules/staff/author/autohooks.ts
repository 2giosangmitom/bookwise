import { addRouteTags } from '@/hooks/onRoute';
import { asClass } from 'awilix';
import StaffAuthorService from './services';
import StaffAuthorController from './controllers';

export default function staffAuthorHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Staff/Author'));

  fastify.diContainer.register({
    staffAuthorService: asClass(StaffAuthorService).singleton(),
    staffAuthorController: asClass(StaffAuthorController).singleton()
  });
}
