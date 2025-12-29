import StaffCategoryController from './controllers';
import { CreateCategorySchema, DeleteCategorySchema, GetCategoriesSchema, UpdateCategorySchema } from './schemas';

export default function staffCategoryRoutes(fastify: FastifyTypeBox) {
  const controller = fastify.diContainer.resolve<StaffCategoryController>('staffCategoryController');

  fastify.get('/', { schema: GetCategoriesSchema }, controller.getCategories.bind(controller));
  fastify.post('/', { schema: CreateCategorySchema }, controller.createCategory.bind(controller));
  fastify.delete('/:category_id', { schema: DeleteCategorySchema }, controller.deleteCategory.bind(controller));
  fastify.put('/:category_id', { schema: UpdateCategorySchema }, controller.updateCategory.bind(controller));
}
