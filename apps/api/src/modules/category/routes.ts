import CategoryController from './controllers';
import { GetCategoriesSchema, GetCategoryBySlugSchema } from './schemas';

export default function categoryRoutes(fastify: FastifyTypeBox) {
  const categoryController = fastify.diContainer.resolve<CategoryController>('categoryController');

  fastify.get('/', { schema: GetCategoriesSchema }, categoryController.getCategories.bind(categoryController));
  fastify.get('/:slug', { schema: GetCategoryBySlugSchema }, categoryController.getCategoryBySlug.bind(categoryController));
}
