import { GetAuthorBySlugSchema } from './schemas';
import type AuthorService from './services';

export default class AuthorController {
  private authorService: AuthorService;

  public constructor({ authorService }: { authorService: AuthorService }) {
    this.authorService = authorService;
  }

  public async getAuthorBySlug(
    req: FastifyRequestTypeBox<typeof GetAuthorBySlugSchema>,
    reply: FastifyReplyTypeBox<typeof GetAuthorBySlugSchema>
  ) {
    const { slug } = req.params;

    const author = await this.authorService.getAuthorBySlug(slug);

    return reply.status(200).send({
      message: 'Author retrieved successfully',
      data: {
        ...author,
        date_of_birth: author.date_of_birth?.toISOString() || null,
        date_of_death: author.date_of_death?.toISOString() || null,
        created_at: author.created_at.toISOString(),
        updated_at: author.updated_at.toISOString()
      }
    });
  }
}
