import { addRouteTags } from '@/hooks/onRoute';
import { asClass } from 'awilix';
import UserService from './services';
import UserController from './controllers';
import { authHook } from '@/hooks/auth';

export default function userHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('User'));
  fastify.addHook('preHandler', authHook);

  fastify.diContainer.register({
    userService: asClass(UserService).singleton(),
    userController: asClass(UserController).singleton()
  });
}
