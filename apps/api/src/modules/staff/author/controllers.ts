import { CreateAuthorSchema, DeleteAuthorSchema, GetAuthorsSchema, UpdateAuthorSchema } from './schemas';
import type StaffAuthorService from './services';

export default class StaffAuthorController {
  private staffAuthorService: StaffAuthorService;

  public constructor({ staffAuthorService }: { staffAuthorService: StaffAuthorService }) {
    this.staffAuthorService = staffAuthorService;
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
    const { page = 1, limit = 10, search, nationality, sort_by = 'name', order = 'asc', is_alive } = req.query;

    const { data: authors, meta } = await this.staffAuthorService.findAuthors(
      { page, limit },
      {
        search,
        nationality,
        isAlive: is_alive
      },
      {
        sortBy: sort_by,
        order
      }
    );

    return reply.status(200).send({
      message: 'Authors retrieved successfully.',
      data: {
        meta: {
          ...meta,
          page,
          limit
        },
        items: authors.map((author) => this.formatAuthor(author))
      }
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
}
