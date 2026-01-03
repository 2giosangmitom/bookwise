import type { PrismaClient } from '@/generated/prisma/client';
import { BookCondition, Prisma } from '@/generated/prisma/client';
import type { Static } from 'typebox';
import { GetBookClonesSchema } from './schemas';
import { httpErrors } from '@fastify/sensible';

export default class StaffBookCloneService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  public async createBookClone(data: {
    book_id: string;
    location_id: string;
    barcode: string;
    condition: BookCondition;
  }) {
    try {
      const createdBookClone = await this.prisma.book_Clone.create({
        data: {
          book_id: data.book_id,
          location_id: data.location_id,
          barcode: data.barcode,
          condition: data.condition
        }
      });

      return createdBookClone;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw httpErrors.conflict('Book clone with the given barcode already exists.');
        }
        if (error.code === 'P2003') {
          throw httpErrors.badRequest('Invalid book_id or location_id provided.');
        }
      }
      throw error;
    }
  }

  public async deleteBookClone(book_clone_id: string) {
    try {
      const deleted = await this.prisma.book_Clone.delete({
        select: { book_clone_id: true, barcode: true },
        where: { book_clone_id }
      });

      return deleted;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw httpErrors.notFound('Book clone with the given ID does not exist.');
        }
      }
      throw error;
    }
  }

  public async updateBookClone(
    book_clone_id: string,
    data: {
      book_id: string;
      location_id: string;
      barcode: string;
      condition: BookCondition;
    }
  ) {
    try {
      const updated = await this.prisma.book_Clone.update({
        where: { book_clone_id },
        data
      });

      return updated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw httpErrors.notFound('Book clone with the given ID does not exist.');
          case 'P2002':
            throw httpErrors.conflict('Book clone with the given barcode already exists.');
          case 'P2003':
            throw httpErrors.badRequest('Invalid book_id or location_id provided.');
        }
      }
      throw error;
    }
  }

  public async getBookClones(query: Static<typeof GetBookClonesSchema.querystring> & { page: number; limit: number }) {
    const filters: Prisma.Book_CloneWhereInput = {};

    if (query.searchTerm) {
      filters.OR = [
        { barcode: { contains: query.searchTerm, mode: 'insensitive' } },
        { location_id: { contains: query.searchTerm, mode: 'insensitive' } },
        { book: { title: { contains: query.searchTerm, mode: 'insensitive' } } }
      ];
    }
    if (query.condition) {
      filters.condition = query.condition;
    }
    if (typeof query.is_available === 'boolean') {
      if (query.is_available) {
        filters.AND = [
          ...(Array.isArray(filters.AND) ? filters.AND : []),
          { OR: [{ loan: { is: null } }, { loan: { is: { status: 'RETURNED' } } }] }
        ];
      } else {
        filters.loan = { is: { status: { not: 'RETURNED' } } };
      }
    }

    const [bookClones, total] = await Promise.all([
      this.prisma.book_Clone.findMany({
        where: filters,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          book_clone_id: true,
          book_id: true,
          location_id: true,
          barcode: true,
          condition: true,
          created_at: true,
          updated_at: true,
          book: {
            select: { title: true }
          },
          loan: {
            select: { status: true }
          }
        }
      }),
      this.prisma.book_Clone.count({ where: filters })
    ]);

    return { bookClones, total };
  }
}
