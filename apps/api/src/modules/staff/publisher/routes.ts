import StaffPublisherController from './controllers';
import {
  CreatePublisherSchema,
  DeletePublisherSchema,
  UpdatePublisherSchema,
  GetPublishersSchema,
  UploadPublisherImageSchema
} from './schemas';

export default function staffPublisherRoutes(fastify: FastifyTypeBox) {
  const controller = fastify.diContainer.resolve<StaffPublisherController>('staffPublisherController');

  fastify.get('/', { schema: GetPublishersSchema }, controller.getPublishers.bind(controller));
  fastify.post('/', { schema: CreatePublisherSchema }, controller.createPublisher.bind(controller));
  fastify.post(
    '/:publisher_slug/image',
    { schema: UploadPublisherImageSchema },
    controller.uploadPublisherImage.bind(controller)
  );
  fastify.put('/:publisher_id', { schema: UpdatePublisherSchema }, controller.updatePublisher.bind(controller));
  fastify.delete('/:publisher_id', { schema: DeletePublisherSchema }, controller.deletePublisher.bind(controller));
}
