import StaffBookCloneController from './controllers';
import { CreateBookCloneSchema, DeleteBookCloneSchema, GetBookClonesSchema, UpdateBookCloneSchema } from './schemas';

export default function staffBookCloneRoutes(fastify: FastifyTypeBox) {
  const staffBookCloneController = fastify.diContainer.resolve<StaffBookCloneController>('staffBookCloneController');

  fastify.get(
    '/',
    { schema: GetBookClonesSchema },
    staffBookCloneController.getBookClones.bind(staffBookCloneController)
  );
  fastify.post(
    '/',
    { schema: CreateBookCloneSchema },
    staffBookCloneController.createBookClone.bind(staffBookCloneController)
  );
  fastify.put(
    '/:book_clone_id',
    { schema: UpdateBookCloneSchema },
    staffBookCloneController.updateBookClone.bind(staffBookCloneController)
  );
  fastify.delete(
    '/:book_clone_id',
    { schema: DeleteBookCloneSchema },
    staffBookCloneController.deleteBookClone.bind(staffBookCloneController)
  );
}
