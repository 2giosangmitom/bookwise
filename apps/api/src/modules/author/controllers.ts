import { GetAuthorBySlugSchema } from './schemas';
import AuthorService from './services';

export default class AuthorController {
  private static instance: AuthorController;
  private authorService: AuthorService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox, authorService: AuthorService) {
    this.fastify = fastify;
    this.authorService = authorService;
  }

  public static getInstance(fastify: FastifyTypeBox, authorService = AuthorService.getInstance(fastify)) {
    if (!AuthorController.instance) {
      AuthorController.instance = new AuthorController(fastify, authorService);
    }
    return AuthorController.instance;
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
