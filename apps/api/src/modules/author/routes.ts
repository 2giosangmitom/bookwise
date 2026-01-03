import AuthorController from './controllers';
import { GetAuthorBySlugSchema } from './schemas';

export default function authorRoutes(fastify: FastifyTypeBox) {
  const authorController = fastify.diContainer.resolve<AuthorController>('authorController');

  fastify.get('/:slug', { schema: GetAuthorBySlugSchema }, authorController.getAuthorBySlug.bind(authorController));
}
