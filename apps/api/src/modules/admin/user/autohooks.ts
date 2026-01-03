import { addRouteTags } from '@/hooks/onRoute';
import { asClass } from 'awilix';
import AdminUserService from './services';
import AdminUserController from './controllers';

export default function adminUserHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Admin/User'));

  fastify.diContainer.register({
    adminUserService: asClass(AdminUserService).singleton(),
    adminUserController: asClass(AdminUserController).singleton()
  });
}
