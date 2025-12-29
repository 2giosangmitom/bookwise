export default class AuthorService {
  private static instance: AuthorService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): AuthorService {
    if (!AuthorService.instance) {
      AuthorService.instance = new AuthorService(fastify);
    }
    return AuthorService.instance;
  }

  public async getAuthorBySlug(slug: string) {
    const author = await this.fastify.prisma.author.findUnique({
      where: { slug }
    });

    if (!author) {
      throw this.fastify.httpErrors.notFound('Author with the given slug does not exist.');
    }

    return author;
  }
}
