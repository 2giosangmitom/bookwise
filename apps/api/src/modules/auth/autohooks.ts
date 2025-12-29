import { addRouteTags } from '@/hooks/onRoute';
import { diContainer } from '@fastify/awilix';
import { asClass } from 'awilix';
import AuthService from './services';
import AuthController from './controllers';

export default function authHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Auth'));

  diContainer.register({
    authService: asClass(AuthService).singleton(),
    authController: asClass(AuthController).singleton()
  });
}
