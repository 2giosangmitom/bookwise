import { authHook } from '@/hooks/auth';
import RatingController from './controllers';
import {
  CreateRatingSchema,
  UpdateRatingSchema,
  DeleteRatingSchema,
  GetBookRatingsSchema,
  GetUserRatingsSchema
} from './schemas';

export default function ratingRoutes(fastify: FastifyTypeBox) {
  const ratingController = fastify.diContainer.resolve<RatingController>('ratingController');

  // Public endpoint - get ratings for a book
  fastify.get('/book/:book_id', { schema: GetBookRatingsSchema }, ratingController.getBookRatings.bind(ratingController));

  // Protected endpoints - require authentication
  fastify.post(
    '/',
    { schema: CreateRatingSchema, preHandler: [authHook] },
    ratingController.createRating.bind(ratingController)
  );

  fastify.put(
    '/:rating_id',
    { schema: UpdateRatingSchema, preHandler: [authHook] },
    ratingController.updateRating.bind(ratingController)
  );

  fastify.delete(
    '/:rating_id',
    { schema: DeleteRatingSchema, preHandler: [authHook] },
    ratingController.deleteRating.bind(ratingController)
  );

  fastify.get(
    '/me',
    { schema: GetUserRatingsSchema, preHandler: [authHook] },
    ratingController.getUserRatings.bind(ratingController)
  );
}
