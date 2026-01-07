import BookController from './controllers';
import { GetNewBooksSchema } from './schemas';

export default function bookRoutes(fastify: FastifyTypeBox) {
  const bookController = fastify.diContainer.resolve<BookController>('bookController');

  fastify.get('/new', { schema: GetNewBooksSchema }, bookController.getNewBooks.bind(bookController));
}
