import type { PrismaClient } from '@/generated/prisma/client';
import { Prisma } from '@/generated/prisma/client';
import type { Static } from 'typebox';
import { GetPublishersSchema } from './schemas';
import { httpErrors } from '@fastify/sensible';

export default class StaffPublisherService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  public async createPublisher(data: { name: string; website: string; slug: string }) {
    try {
      const created = await this.prisma.publisher.create({ data: { ...data } });
      return created;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw httpErrors.conflict('Publisher with the given slug already exists.');
        }
      }
      throw error;
    }
  }

  public async deletePublisher(publisher_id: string) {
    try {
      const deleted = await this.prisma.publisher.delete({
        select: { publisher_id: true, name: true },
        where: { publisher_id }
      });
      return deleted;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw httpErrors.notFound('Publisher with the given ID does not exist.');
        }
      }
      throw error;
    }
  }

  public async updatePublisher(publisher_id: string, data: { name: string; website: string; slug: string }) {
    try {
      const updated = await this.prisma.publisher.update({
        where: { publisher_id },
        data: { ...data }
      });

      return updated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw httpErrors.notFound('Publisher with the given ID does not exist.');
          case 'P2002':
            throw httpErrors.conflict('Publisher with the given slug already exists.');
        }
      }
      throw error;
    }
  }

  public async getPublishers(query: Static<typeof GetPublishersSchema.querystring> & { page: number; limit: number }) {
    const where: Prisma.PublisherWhereInput = query.searchTerm
      ? {
          OR: [
            { name: { contains: query.searchTerm, mode: 'insensitive' } },
            { website: { contains: query.searchTerm, mode: 'insensitive' } },
            { slug: { contains: query.searchTerm, mode: 'insensitive' } }
          ]
        }
      : {};

    const [publishers, total] = await Promise.all([
      this.prisma.publisher.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          publisher_id: true,
          name: true,
          website: true,
          slug: true,
          image_url: true,
          created_at: true,
          updated_at: true
        }
      }),
      this.prisma.publisher.count({ where })
    ]);

    return { publishers, total };
  }
}
