import { diContainer } from '@fastify/awilix';
import AdminUserController from './controllers';
import { GetUsersSchema, UpdateUserSchema } from './schemas';

export default function adminUserRoutes(fastify: FastifyTypeBox) {
  const controller = diContainer.resolve<AdminUserController>('adminUserController');

  fastify.get('/', { schema: GetUsersSchema }, controller.getUsers.bind(controller));
  fastify.put('/:userId', { schema: UpdateUserSchema }, controller.updateUser.bind(controller));
}
