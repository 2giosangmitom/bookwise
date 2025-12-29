import PublisherController from './controllers';
import { GetPublisherBySlugSchema } from './schemas';

export default function publisherRoutes(fastify: FastifyTypeBox) {
  const publisherController = PublisherController.getInstance(fastify);

  fastify.get(
    '/:slug',
    { schema: GetPublisherBySlugSchema },
    publisherController.getPublisherBySlug.bind(publisherController)
  );
}
