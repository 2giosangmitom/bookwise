import StaffBookController from './controllers';
import { CreateBookSchema, DeleteBookSchema, UpdateBookSchema, GetBooksSchema } from './schemas';

export default function staffBookRoutes(fastify: FastifyTypeBox) {
  const staffBookController = fastify.diContainer.resolve<StaffBookController>('staffBookController');

  fastify.get('/', { schema: GetBooksSchema }, staffBookController.getBooks.bind(staffBookController));
  fastify.post('/', { schema: CreateBookSchema }, staffBookController.createBook.bind(staffBookController));
  fastify.delete('/:book_id', { schema: DeleteBookSchema }, staffBookController.deleteBook.bind(staffBookController));
  fastify.put('/:book_id', { schema: UpdateBookSchema }, staffBookController.updateBook.bind(staffBookController));
}
