import { diContainer } from '@fastify/awilix';
import AdminUserController from './controllers';
import { GetUsersSchema } from './schemas';

export default function adminUserRoutes(fastify: FastifyTypeBox) {
  const controller = diContainer.resolve<AdminUserController>('adminUserController');

  fastify.get('/', { schema: GetUsersSchema }, controller.getUsers.bind(controller));
}
