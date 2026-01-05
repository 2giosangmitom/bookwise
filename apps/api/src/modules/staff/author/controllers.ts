import { DeleteObjectCommand, PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import {
  CreateAuthorSchema,
  DeleteAuthorSchema,
  GetAuthorsSchema,
  UpdateAuthorSchema,
  UploadAuthorImageSchema
} from './schemas';
import type StaffAuthorService from './services';
import type AuthorService from '@/modules/author/services';
import { httpErrors } from '@fastify/sensible';
import path from 'node:path';
import { allowedImageTypes } from '@/constants';

export default class StaffAuthorController {
  private staffAuthorService: StaffAuthorService;
  private authorService: AuthorService;
  private s3Client: S3Client;

  public constructor({
    staffAuthorService,
    authorService,
    s3Client
  }: {
    staffAuthorService: StaffAuthorService;
    authorService: AuthorService;
    s3Client: S3Client;
  }) {
    this.staffAuthorService = staffAuthorService;
    this.authorService = authorService;
    this.s3Client = s3Client;
  }

  private formatAuthor(author: {
    author_id: string;
    name: string;
    short_biography: string;
    biography: string;
    date_of_birth: Date | null;
    date_of_death: Date | null;
    nationality: string | null;
    image_url: string | null;
    slug: string;
    created_at: Date;
    updated_at: Date;
  }) {
    return {
      ...author,
      image_url: author.image_url ? `${process.env.RUSTFS_ENDPOINT}/${author.image_url}` : null,
      date_of_birth: author.date_of_birth?.toISOString() ?? null,
      date_of_death: author.date_of_death?.toISOString() ?? null,
      created_at: author.created_at.toISOString(),
      updated_at: author.updated_at.toISOString()
    };
  }

  public async getAuthors(
    req: FastifyRequestTypeBox<typeof GetAuthorsSchema>,
    reply: FastifyReplyTypeBox<typeof GetAuthorsSchema>
  ) {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 10;
    const { searchTerm, is_alive } = req.query;

    const { data: authors, meta } = await this.staffAuthorService.findAuthors(
      { page, limit },
      {
        searchTerm,
        isAlive: is_alive
      }
    );

    return reply.status(200).send({
      message: 'Authors retrieved successfully.',
      meta: {
        total: meta.total,
        totalOnPage: authors.length,
        page,
        limit
      },
      data: authors.map((author) => this.formatAuthor(author))
    });
  }

  public async createAuthor(
    req: FastifyRequestTypeBox<typeof CreateAuthorSchema>,
    reply: FastifyReplyTypeBox<typeof CreateAuthorSchema>
  ) {
    const { name, short_biography, biography, date_of_birth, date_of_death, nationality, slug } = req.body;

    const createdAuthor = await this.staffAuthorService.createAuthor({
      name,
      short_biography,
      biography,
      date_of_birth,
      date_of_death,
      nationality,
      slug
    });

    return reply.status(201).send({
      message: 'Author created successfully.',
      data: this.formatAuthor(createdAuthor)
    });
  }

  public async deleteAuthor(
    req: FastifyRequestTypeBox<typeof DeleteAuthorSchema>,
    reply: FastifyReplyTypeBox<typeof DeleteAuthorSchema>
  ) {
    const { author_id } = req.params;

    const deletedAuthor = await this.staffAuthorService.deleteAuthor(author_id);

    return reply.status(200).send({
      message: 'Author deleted successfully',
      data: deletedAuthor
    });
  }

  public async updateAuthor(
    req: FastifyRequestTypeBox<typeof UpdateAuthorSchema>,
    reply: FastifyReplyTypeBox<typeof UpdateAuthorSchema>
  ) {
    const { author_id } = req.params;
    const { name, short_biography, biography, date_of_birth, date_of_death, nationality, slug } = req.body;

    const updatedAuthor = await this.staffAuthorService.updateAuthor(author_id, {
      name,
      short_biography,
      biography,
      date_of_birth,
      date_of_death,
      nationality,
      slug
    });

    return reply.status(200).send({
      message: 'Author updated successfully',
      data: this.formatAuthor(updatedAuthor)
    });
  }

  public async uploadAuthorImage(
    req: FastifyRequestTypeBox<typeof UploadAuthorImageSchema>,
    reply: FastifyReplyTypeBox<typeof UploadAuthorImageSchema>
  ) {
    const author = await this.authorService.getAuthorBySlug(req.params.author_slug);

    // Delete previous image from S3 if exists
    if (author.image_url) {
      const pathParts = author.image_url.split('/');
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: pathParts[0],
            Key: pathParts[1]
          })
        );
      } catch (error) {
        req.log.error('Error deleting previous author image from S3: %s', error);
      }
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
        Bucket: 'bookwise-authors',
        Key: `${author.author_id}${path.extname(data.filename)}`,
        Body: buffer,
        ContentType: data.mimetype
      })
    );

    // Update author record with new image URL
    await req.server.prisma.author.update({
      where: { author_id: author.author_id },
      data: {
        image_url: `bookwise-authors/${author.author_id}${path.extname(data.filename)}`
      }
    });

    return reply.status(200).send({
      message: 'Author image uploaded successfully'
    });
  }
}
