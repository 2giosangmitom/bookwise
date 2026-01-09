import type { PrismaClient } from '@/generated/prisma/client';
import { Prisma } from '@/generated/prisma/client';
import { httpErrors } from '@fastify/sensible';

export default class RatingService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  public async createRating(data: { book_id: string; user_id: string; rate: number; comment: string }) {
    // Check if book exists
    const book = await this.prisma.book.findUnique({
      where: { book_id: data.book_id },
      select: { book_id: true }
    });

    if (!book) {
      throw httpErrors.notFound('Book not found');
    }

    // Check if user already rated this book
    const existingRating = await this.prisma.rating.findFirst({
      where: {
        book_id: data.book_id,
        user_id: data.user_id
      }
    });

    if (existingRating) {
      throw httpErrors.conflict('You have already rated this book');
    }

    try {
      const rating = await this.prisma.rating.create({
        data: {
          book_id: data.book_id,
          user_id: data.user_id,
          rate: data.rate,
          comment: data.comment
        },
        include: {
          user: {
            select: { name: true }
          }
        }
      });

      return {
        rating_id: rating.rating_id,
        book_id: rating.book_id,
        user_id: rating.user_id,
        user_name: rating.user.name,
        rate: rating.rate,
        comment: rating.comment,
        created_at: rating.created_at.toISOString(),
        updated_at: rating.updated_at.toISOString()
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw httpErrors.notFound('Book not found');
        }
      }
      throw error;
    }
  }

  public async updateRating(rating_id: string, user_id: string, data: { rate: number; comment: string }) {
    // Check if rating exists and belongs to user
    const existingRating = await this.prisma.rating.findUnique({
      where: { rating_id }
    });

    if (!existingRating) {
      throw httpErrors.notFound('Rating not found');
    }

    if (existingRating.user_id !== user_id) {
      throw httpErrors.forbidden('You can only update your own ratings');
    }

    const rating = await this.prisma.rating.update({
      where: { rating_id },
      data: {
        rate: data.rate,
        comment: data.comment
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    return {
      rating_id: rating.rating_id,
      book_id: rating.book_id,
      user_id: rating.user_id,
      user_name: rating.user.name,
      rate: rating.rate,
      comment: rating.comment,
      created_at: rating.created_at.toISOString(),
      updated_at: rating.updated_at.toISOString()
    };
  }

  public async deleteRating(rating_id: string, user_id: string) {
    // Check if rating exists and belongs to user
    const existingRating = await this.prisma.rating.findUnique({
      where: { rating_id }
    });

    if (!existingRating) {
      throw httpErrors.notFound('Rating not found');
    }

    if (existingRating.user_id !== user_id) {
      throw httpErrors.forbidden('You can only delete your own ratings');
    }

    await this.prisma.rating.delete({
      where: { rating_id }
    });

    return { rating_id };
  }

  public async getBookRatings(book_id: string, page: number, limit: number) {
    // Check if book exists
    const book = await this.prisma.book.findUnique({
      where: { book_id },
      select: { book_id: true }
    });

    if (!book) {
      throw httpErrors.notFound('Book not found');
    }

    const [ratings, total, aggregate] = await Promise.all([
      this.prisma.rating.findMany({
        where: { book_id },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: { name: true }
          }
        }
      }),
      this.prisma.rating.count({ where: { book_id } }),
      this.prisma.rating.aggregate({
        where: { book_id },
        _avg: { rate: true }
      })
    ]);

    return {
      ratings: ratings.map((rating) => ({
        rating_id: rating.rating_id,
        book_id: rating.book_id,
        user_id: rating.user_id,
        user_name: rating.user.name,
        rate: rating.rate,
        comment: rating.comment,
        created_at: rating.created_at.toISOString(),
        updated_at: rating.updated_at.toISOString()
      })),
      total,
      averageRating: aggregate._avg.rate ? Math.round(aggregate._avg.rate * 10) / 10 : null
    };
  }

  public async getUserRatings(user_id: string, page: number, limit: number) {
    const [ratings, total] = await Promise.all([
      this.prisma.rating.findMany({
        where: { user_id },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          book: {
            select: { title: true }
          }
        }
      }),
      this.prisma.rating.count({ where: { user_id } })
    ]);

    return {
      ratings: ratings.map((rating) => ({
        rating_id: rating.rating_id,
        book_id: rating.book_id,
        book_title: rating.book.title,
        rate: rating.rate,
        comment: rating.comment,
        created_at: rating.created_at.toISOString(),
        updated_at: rating.updated_at.toISOString()
      })),
      total
    };
  }
}
