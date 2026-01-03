import { addRouteTags } from '@/hooks/onRoute';
import { asClass } from 'awilix';
import AuthService from './services';
import AuthController from './controllers';

export default function authHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Auth'));

  fastify.diContainer.register({
    authService: asClass(AuthService).singleton(),
    authController: asClass(AuthController).singleton()
  });
}
