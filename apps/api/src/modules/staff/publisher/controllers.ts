import { DeleteObjectCommand, PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import {
  CreatePublisherSchema,
  DeletePublisherSchema,
  UpdatePublisherSchema,
  GetPublishersSchema,
  UploadPublisherImageSchema
} from './schemas';
import type StaffPublisherService from './services';
import { httpErrors } from '@fastify/sensible';
import type PublisherService from '@/modules/publisher/services';
import path from 'node:path';
import { allowedImageTypes } from '@/constants';

export default class StaffPublisherController {
  private staffPublisherService: StaffPublisherService;
  private publisherService: PublisherService;
  private s3Client: S3Client;

  public constructor({
    staffPublisherService,
    s3Client,
    publisherService
  }: {
    staffPublisherService: StaffPublisherService;
    s3Client: S3Client;
    publisherService: PublisherService;
  }) {
    this.staffPublisherService = staffPublisherService;
    this.s3Client = s3Client;
    this.publisherService = publisherService;
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
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 10;
    const { publishers, total } = await this.staffPublisherService.getPublishers({
      ...req.query,
      page,
      limit
    });

    return reply.status(200).send({
      message: 'Publishers retrieved successfully',
      meta: {
        total,
        totalOnPage: publishers.length,
        page,
        limit
      },
      data: publishers.map((publisher) => ({
        ...publisher,
        created_at: publisher.created_at.toISOString(),
        updated_at: publisher.updated_at.toISOString()
      }))
    });
  }

  public async uploadPublisherImage(
    req: FastifyRequestTypeBox<typeof UploadPublisherImageSchema>,
    reply: FastifyReplyTypeBox<typeof UploadPublisherImageSchema>
  ) {
    const publisher = await this.publisherService.getPublisherBySlug(req.params.publisher_slug);

    // Delete previous image from S3 if exists
    if (publisher.image_url) {
      const pathParts = publisher.image_url.split('/');
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: pathParts[0],
          Key: pathParts[1]
        })
      );
    }

    const data = await req.file();
    if (!data) {
      throw httpErrors.badRequest('File not provided');
    }

    if (!allowedImageTypes.includes(data.mimetype)) {
      throw httpErrors.badRequest(`Invalid file type: ${data.mimetype}`);
    }

    const buffer = await data.toBuffer();
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: 'bookwise-publishers',
        Key: `${publisher.publisher_id}${path.extname(data.filename)}`,
        Body: buffer,
        ContentType: data.mimetype
      })
    );

    await req.server.prisma.publisher.update({
      where: { publisher_id: publisher.publisher_id },
      data: {
        image_url: `bookwise-publishers/${publisher.slug}${path.extname(data.filename)}`
      }
    });

    return reply.status(200).send({
      message: 'Publisher image uploaded successfully'
    });
  }
}
