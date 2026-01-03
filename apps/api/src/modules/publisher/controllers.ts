import { GetPublisherBySlugSchema } from './schemas';
import type PublisherService from './services';

export default class PublisherController {
  private publisherService: PublisherService;

  public constructor({ publisherService }: { publisherService: PublisherService }) {
    this.publisherService = publisherService;
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
