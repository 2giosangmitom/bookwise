import { addRouteTags } from '@/hooks/onRoute';
import { asClass } from 'awilix';
import CategoryService from './services';
import CategoryController from './controllers';

export default function categoryHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Category'));

  fastify.diContainer.register({
    categoryService: asClass(CategoryService).singleton(),
    categoryController: asClass(CategoryController).singleton()
  });
}
