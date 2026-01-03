import PublisherController from './controllers';
import { GetPublisherBySlugSchema } from './schemas';

export default function publisherRoutes(fastify: FastifyTypeBox) {
  const publisherController = fastify.diContainer.resolve<PublisherController>('publisherController');

  fastify.get(
    '/:slug',
    { schema: GetPublisherBySlugSchema },
    publisherController.getPublisherBySlug.bind(publisherController)
  );
}
