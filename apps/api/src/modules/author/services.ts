import type { PrismaClient } from '@/generated/prisma/client';
import { httpErrors } from '@fastify/sensible';

export default class AuthorService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  public async getAuthorBySlug(slug: string) {
    const author = await this.prisma.author.findUnique({
      where: { slug }
    });

    if (!author) {
      throw httpErrors.notFound('Author with the given slug does not exist.');
    }

    return author;
  }
}
