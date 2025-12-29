import { CreatePublisherSchema, DeletePublisherSchema, UpdatePublisherSchema, GetPublishersSchema } from './schemas';
import type StaffPublisherService from './services';

export default class StaffPublisherController {
  private staffPublisherService: StaffPublisherService;

  public constructor({ staffPublisherService }: { staffPublisherService: StaffPublisherService }) {
    this.staffPublisherService = staffPublisherService;
  }

  public async createPublisher(
    req: FastifyRequestTypeBox<typeof CreatePublisherSchema>,
    reply: FastifyReplyTypeBox<typeof CreatePublisherSchema>
  ) {
    const { name, website, slug } = req.body;

    const created = await this.staffPublisherService.createPublisher({ name, website, slug });

    return reply.status(201).send({
      message: 'Publisher created successfully.',
      data: {
        ...created,
        created_at: created.created_at.toISOString(),
        updated_at: created.updated_at.toISOString()
      }
    });
  }

  public async deletePublisher(
    req: FastifyRequestTypeBox<typeof DeletePublisherSchema>,
    reply: FastifyReplyTypeBox<typeof DeletePublisherSchema>
  ) {
    const { publisher_id } = req.params;

    const deleted = await this.staffPublisherService.deletePublisher(publisher_id);

    return reply.status(200).send({ message: 'Publisher deleted successfully', data: deleted });
  }

  public async updatePublisher(
    req: FastifyRequestTypeBox<typeof UpdatePublisherSchema>,
    reply: FastifyReplyTypeBox<typeof UpdatePublisherSchema>
  ) {
    const { publisher_id } = req.params;
    const { name, website, slug } = req.body;

    const updated = await this.staffPublisherService.updatePublisher(publisher_id, {
      name,
      website,
      slug
    });

    return reply.status(200).send({
      message: 'Publisher updated successfully',
      data: {
        ...updated,
        created_at: updated.created_at.toISOString(),
        updated_at: updated.updated_at.toISOString()
      }
    });
  }

  public async getPublishers(
    req: FastifyRequestTypeBox<typeof GetPublishersSchema>,
    reply: FastifyReplyTypeBox<typeof GetPublishersSchema>
  ) {
    const { publishers, total } = await this.staffPublisherService.getPublishers({
      ...req.query,
      page: req.query.page ?? 1,
      limit: req.query.limit ?? 100
    });
    const totalPages = Math.ceil(total / (req.query.limit ?? 100));

    return reply.status(200).send({
      message: 'Publishers retrieved successfully',
      meta: {
        totalPages
      },
      data: publishers.map((publisher) => ({
        ...publisher,
        created_at: publisher.created_at.toISOString(),
        updated_at: publisher.updated_at.toISOString()
      }))
    });
  }
}
