import { GetPublisherBySlugSchema } from './schemas';
import PublisherService from './services';

export default class PublisherController {
  private static instance: PublisherController;
  private publisherService: PublisherService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox, publisherService: PublisherService) {
    this.fastify = fastify;
    this.publisherService = publisherService;
  }

  public static getInstance(fastify: FastifyTypeBox, publisherService = PublisherService.getInstance(fastify)) {
    if (!PublisherController.instance) {
      PublisherController.instance = new PublisherController(fastify, publisherService);
    }
    return PublisherController.instance;
  }

  public async getPublisherBySlug(
    req: FastifyRequestTypeBox<typeof GetPublisherBySlugSchema>,
    reply: FastifyReplyTypeBox<typeof GetPublisherBySlugSchema>
  ) {
    const { slug } = req.params;

    const publisher = await this.publisherService.getPublisherBySlug(slug);

    return reply.status(200).send({
      message: 'Publisher retrieved successfully',
      data: {
        ...publisher,
        created_at: publisher.created_at.toISOString(),
        updated_at: publisher.updated_at.toISOString()
      }
    });
  }
}
