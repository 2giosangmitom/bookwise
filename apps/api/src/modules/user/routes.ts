import UserController from './controllers';
import { GetMeSchema, ChangePasswordSchema } from './schemas';

export default function userRoutes(fastify: FastifyTypeBox) {
  const userController = fastify.diContainer.resolve<UserController>('userController');

  fastify.get('/me', { schema: GetMeSchema }, userController.getMe.bind(userController));

  fastify.patch(
    '/change-password',
    { schema: ChangePasswordSchema },
    userController.changePassword.bind(userController)
  );
}
