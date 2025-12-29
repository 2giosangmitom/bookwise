export default class PublisherService {
  private static instance: PublisherService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): PublisherService {
    if (!PublisherService.instance) {
      PublisherService.instance = new PublisherService(fastify);
    }
    return PublisherService.instance;
  }

  public async getPublisherBySlug(slug: string) {
    const publisher = await this.fastify.prisma.publisher.findUnique({
      where: { slug }
    });

    if (!publisher) {
      throw this.fastify.httpErrors.notFound('Publisher with the given slug does not exist.');
    }

    return publisher;
  }
}
