import { addRouteTags } from '@/hooks/onRoute';
import { asClass } from 'awilix';
import BookService from './services';
import BookController from './controllers';

export default function bookHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Book'));

  fastify.diContainer.register({
    bookService: asClass(BookService).singleton(),
    bookController: asClass(BookController).singleton()
  });
}
