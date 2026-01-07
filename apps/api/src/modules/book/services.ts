import type { PrismaClient } from '@/generated/prisma/client';

export default class BookService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  public async getNewBooks(limit: number = 8) {
    const books = await this.prisma.book.findMany({
      take: limit,
      orderBy: {
        created_at: 'desc'
      },
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
        },
        book_clones: {
          select: {
            loan: {
              select: {
                status: true
              }
            }
          }
        }
      }
    });

    // Transform the data to include availability counts
    const booksWithAvailability = books.map((book) => {
      // A book is available if it has at least one clone that is not borrowed
      const availableCopies = book.book_clones.filter(
        (clone) => !clone.loan || clone.loan.status !== 'BORROWED'
      ).length;
      return {
        book_id: book.book_id,
        title: book.title,
        description: book.description,
        isbn: book.isbn,
        published_at: book.published_at.toISOString(),
        publisher_id: book.publisher_id,
        publisher_name: book.publisher?.name ?? null,
        image_url: book.image_url,
        authors: book.authors.map((a) => a.author),
        categories: book.categories.map((c) => c.category),
        available_copies: availableCopies,
        total_copies: book.book_clones.length,
        created_at: book.created_at.toISOString(),
        updated_at: book.updated_at.toISOString()
      };
    });

    return booksWithAvailability;
  }
}
