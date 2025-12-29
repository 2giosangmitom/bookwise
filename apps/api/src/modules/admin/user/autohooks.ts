import { diContainer } from '@fastify/awilix';
import { asClass } from 'awilix';
import AdminUserService from './services';
import AdminUserController from './controllers';

export default function adminUserHooks() {
  diContainer.register({
    adminUserService: asClass(AdminUserService).singleton(),
    adminUserController: asClass(AdminUserController).singleton()
  });
}
