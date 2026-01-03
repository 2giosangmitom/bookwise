import type { PrismaClient } from '@/generated/prisma/client';
import { httpErrors } from '@fastify/sensible';

export default class PublisherService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  public async getPublisherBySlug(slug: string) {
    const publisher = await this.prisma.publisher.findUnique({
      where: { slug }
    });

    if (!publisher) {
      throw httpErrors.notFound('Publisher with the given slug does not exist.');
    }

    return publisher;
  }
}
