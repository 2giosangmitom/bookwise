import { addRouteTags } from '@/hooks/onRoute';
import { asClass } from 'awilix';
import AuthorService from './services';
import AuthorController from './controllers';

export default function authorHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Author'));

  fastify.diContainer.register({
    authorService: asClass(AuthorService).singleton(),
    authorController: asClass(AuthorController).singleton()
  });
}
