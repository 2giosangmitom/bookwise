import type { PrismaClient } from '@/generated/prisma/client';
import { Prisma } from '@/generated/prisma/client';
import type { Static } from 'typebox';
import { GetBooksSchema } from './schemas';
import { httpErrors } from '@fastify/sensible';

export default class StaffBookService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  public async createBook(data: {
    title: string;
    description: string;
    isbn: string;
    published_at: string;
    publisher_id: string | null;
    authors?: string[];
    categories?: string[];
  }) {
    try {
      const createdBook = await this.prisma.book.create({
        data: {
          title: data.title,
          description: data.description,
          isbn: data.isbn,
          published_at: new Date(data.published_at),
          publisher_id: data.publisher_id ?? null,
          authors: data.authors && {
            create: data.authors.map((author_id) => ({
              author_id
            }))
          },
          categories: data.categories && {
            create: data.categories.map((category_id) => ({
              category_id
            }))
          }
        },
        include: {
          authors: { select: { author_id: true } },
          categories: { select: { category_id: true } }
        }
      });

      return createdBook;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw httpErrors.conflict('Book with the given ISBN already exists.');
        }
      }
      throw error;
    }
  }

  public async deleteBook(book_id: string) {
    try {
      const deleted = await this.prisma.book.delete({
        select: { book_id: true, title: true },
        where: { book_id }
      });

      return deleted;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw httpErrors.notFound('Book with the given ID does not exist.');
        }
      }
      throw error;
    }
  }

  public async updateBook(
    book_id: string,
    data: {
      title: string;
      description: string;
      isbn: string;
      published_at: string;
      publisher_id: string | null;
      authors?: string[];
      categories?: string[];
    }
  ) {
    try {
      const updatedBook = await this.prisma.book.update({
        include: {
          authors: { select: { author_id: true } },
          categories: { select: { category_id: true } }
        },
        data: {
          title: data.title,
          description: data.description,
          isbn: data.isbn,
          published_at: data.published_at,
          publisher_id: data.publisher_id,
          authors: data.authors && {
            deleteMany: { book_id }, // Delete all authors associated with this book
            create: data.authors.map((author_id) => ({
              author_id
            }))
          },
          categories: data.categories && {
            deleteMany: { book_id },
            create: data.categories.map((category_id) => ({ category_id }))
          }
        },
        where: {
          book_id
        }
      });

      return updatedBook;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw httpErrors.notFound('Book with the given ID does not exist.');
          case 'P2002':
            throw httpErrors.conflict('Book with the given ISBN already exists.');
        }
      }
      throw error;
    }
  }

  public async getBooks(query: Static<typeof GetBooksSchema.querystring> & { page: number; limit: number }) {
    const where: Prisma.BookWhereInput = query.searchTerm
      ? {
          OR: [
            { title: { contains: query.searchTerm, mode: 'insensitive' } },
            { isbn: { contains: query.searchTerm, mode: 'insensitive' } },
            { description: { contains: query.searchTerm, mode: 'insensitive' } }
          ]
        }
      : {};

    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ created_at: 'desc' }],
        select: {
          book_id: true,
          title: true,
          description: true,
          isbn: true,
          published_at: true,
          publisher_id: true,
          publisher: {
            select: {
              name: true
            }
          },
          image_url: true,
          created_at: true,
          updated_at: true,
          authors: {
            select: {
              author: {
                select: {
                  author_id: true,
                  name: true
                }
              }
            }
          },
          categories: {
            select: {
              category: {
                select: {
                  category_id: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      this.prisma.book.count({ where })
    ]);

    return { books, total };
  }
}
