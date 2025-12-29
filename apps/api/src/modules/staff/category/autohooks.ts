import { addRouteTags } from '@/hooks/onRoute';
import { asClass } from 'awilix';
import StaffCategoryService from './services';
import StaffCategoryController from './controllers';

export default function staffCategoryHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Staff/Category'));

  fastify.diContainer.register({
    staffCategoryService: asClass(StaffCategoryService).singleton(),
    staffCategoryController: asClass(StaffCategoryController).singleton()
  });
}
