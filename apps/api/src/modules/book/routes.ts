import BookController from './controllers';
import { GetNewBooksSchema, SearchBooksSchema, GetBookByIdSchema } from './schemas';

export default function bookRoutes(fastify: FastifyTypeBox) {
  const bookController = fastify.diContainer.resolve<BookController>('bookController');

  // Public catalog endpoints
  fastify.get('/search', { schema: SearchBooksSchema }, bookController.searchBooks.bind(bookController));
  fastify.get('/new', { schema: GetNewBooksSchema }, bookController.getNewBooks.bind(bookController));
  fastify.get('/:book_id', { schema: GetBookByIdSchema }, bookController.getBookById.bind(bookController));
}
