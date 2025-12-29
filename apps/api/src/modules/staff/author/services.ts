import type { PrismaClient } from '@/generated/prisma/client';
import { Prisma } from '@/generated/prisma/client';
import { httpErrors } from '@fastify/sensible';

export default class StaffAuthorService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  public async createAuthor(data: {
    name: string;
    short_biography: string;
    biography: string;
    date_of_birth: string | null;
    date_of_death: string | null;
    nationality: string | null;
    slug: string;
  }) {
    try {
      const createdAuthor = await this.prisma.author.create({
        data: {
          ...data
        }
      });

      return createdAuthor;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw httpErrors.conflict('Author with the given slug already exists.');
        }
      }
      throw error;
    }
  }

  public async deleteAuthor(author_id: string) {
    try {
      const deletedAuthor = await this.prisma.author.delete({
        select: { author_id: true, name: true },
        where: { author_id }
      });

      return deletedAuthor;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw httpErrors.notFound('Author with the given ID does not exist.');
        }
      }
      throw error;
    }
  }

  public async updateAuthor(
    author_id: string,
    data: {
      name: string;
      short_biography: string;
      biography: string;
      date_of_birth: string | null;
      date_of_death: string | null;
      nationality: string | null;
      slug: string;
    }
  ) {
    try {
      const updatedAuthor = await this.prisma.author.update({
        where: { author_id },
        data: {
          ...data
        }
      });

      return updatedAuthor;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw httpErrors.notFound('Author with the given ID does not exist.');
          case 'P2002':
            throw httpErrors.conflict('Author with the given slug already exists.');
        }
      }
      throw error;
    }
  }

  public async findAuthors(
    paginationOpts: { page: number; limit: number },
    filterOpts: {
      search?: string;
      nationality?: string;
      isAlive?: boolean;
    } = {},
    sortOpts: {
      sortBy: 'name' | 'created_at' | 'updated_at';
      order: 'asc' | 'desc';
    } = { sortBy: 'name', order: 'asc' }
  ) {
    const { page, limit } = paginationOpts;

    const andFilters: Prisma.AuthorWhereInput[] = [];

    if (filterOpts.search) {
      andFilters.push({
        name: { contains: filterOpts.search, mode: 'insensitive' }
      });
    }

    if (filterOpts.nationality) {
      andFilters.push({
        nationality: { equals: filterOpts.nationality, mode: 'insensitive' }
      });
    }

    if (filterOpts.isAlive === true) {
      andFilters.push({ date_of_death: null });
    } else if (filterOpts.isAlive === false) {
      andFilters.push({ date_of_death: { not: null } });
    }

    const where: Prisma.AuthorWhereInput = andFilters.length > 0 ? { AND: andFilters } : {};

    const sortFieldMap = {
      name: 'name',
      created_at: 'created_at',
      updated_at: 'updated_at'
    } as const;

    const orderBy: Prisma.AuthorOrderByWithRelationInput[] = [
      { [sortFieldMap[sortOpts.sortBy]]: sortOpts.order } as Prisma.AuthorOrderByWithRelationInput,
      { author_id: 'asc' }
    ];

    const [authors, total] = await Promise.all([
      this.prisma.author.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          author_id: true,
          name: true,
          short_biography: true,
          biography: true,
          date_of_birth: true,
          date_of_death: true,
          nationality: true,
          image_url: true,
          slug: true,
          created_at: true,
          updated_at: true
        }
      }),
      this.prisma.author.count({ where })
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      meta: {
        total,
        page,
        limit,
        totalPages
      },
      data: authors
    };
  }
}
