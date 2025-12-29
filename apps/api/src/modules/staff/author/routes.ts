import StaffAuthorController from './controllers';
import { CreateAuthorSchema, DeleteAuthorSchema, GetAuthorsSchema, UpdateAuthorSchema } from './schemas';

export default function staffAuthorRoutes(fastify: FastifyTypeBox) {
  const staffAuthorController = fastify.diContainer.resolve<StaffAuthorController>('staffAuthorController');

  fastify.get('/', { schema: GetAuthorsSchema }, staffAuthorController.getAuthors.bind(staffAuthorController));
  fastify.post('/', { schema: CreateAuthorSchema }, staffAuthorController.createAuthor.bind(staffAuthorController));
  fastify.delete(
    '/:author_id',
    { schema: DeleteAuthorSchema },
    staffAuthorController.deleteAuthor.bind(staffAuthorController)
  );
  fastify.put(
    '/:author_id',
    { schema: UpdateAuthorSchema },
    staffAuthorController.updateAuthor.bind(staffAuthorController)
  );
}
