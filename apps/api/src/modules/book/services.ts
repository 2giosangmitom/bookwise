import type { PrismaClient } from '@/generated/prisma/client';
import { Prisma } from '@/generated/prisma/client';
import { httpErrors } from '@fastify/sensible';

interface SearchBooksQuery {
  page: number;
  limit: number;
  searchTerm?: string;
  category_id?: string;
  author_id?: string;
  available_only?: boolean;
  sort_by?: 'newest' | 'oldest' | 'title' | 'rating';
}

export default class BookService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  private transformBookWithAvailability(book: {
    book_id: string;
    title: string;
    description: string;
    isbn: string;
    published_at: Date;
    publisher_id: string | null;
    publisher: { name: string } | null;
    image_url: string | null;
    created_at: Date;
    updated_at: Date;
    authors: { author: { author_id: string; name: string } }[];
    categories: { category: { category_id: string; name: string } }[];
    book_clones: { loan: { status: string } | null }[];
    ratings: { rate: number }[];
  }) {
    const availableCopies = book.book_clones.filter(
      (clone) => !clone.loan || clone.loan.status !== 'BORROWED'
    ).length;

    const ratingCount = book.ratings.length;
    const averageRating =
      ratingCount > 0 ? Math.round((book.ratings.reduce((sum, r) => sum + r.rate, 0) / ratingCount) * 10) / 10 : null;

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
      average_rating: averageRating,
      rating_count: ratingCount,
      created_at: book.created_at.toISOString(),
      updated_at: book.updated_at.toISOString()
    };
  }

  private getBookSelect() {
    return {
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
      },
      ratings: {
        select: {
          rate: true
        }
      }
    } as const;
  }

  public async searchBooks(query: SearchBooksQuery) {
    const where: Prisma.BookWhereInput = {};

    // Search term filter
    if (query.searchTerm) {
      where.OR = [
        { title: { contains: query.searchTerm, mode: 'insensitive' } },
        { isbn: { contains: query.searchTerm, mode: 'insensitive' } },
        { description: { contains: query.searchTerm, mode: 'insensitive' } },
        {
          authors: {
            some: {
              author: {
                name: { contains: query.searchTerm, mode: 'insensitive' }
              }
            }
          }
        }
      ];
    }

    // Category filter
    if (query.category_id) {
      where.categories = {
        some: {
          category_id: query.category_id
        }
      };
    }

    // Author filter
    if (query.author_id) {
      where.authors = {
        some: {
          author_id: query.author_id
        }
      };
    }

    // Determine sort order
    let orderBy: Prisma.BookOrderByWithRelationInput[] = [{ created_at: 'desc' }];
    switch (query.sort_by) {
      case 'oldest':
        orderBy = [{ created_at: 'asc' }];
        break;
      case 'title':
        orderBy = [{ title: 'asc' }];
        break;
      case 'newest':
      default:
        orderBy = [{ created_at: 'desc' }];
        break;
    }

    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy,
        select: this.getBookSelect()
      }),
      this.prisma.book.count({ where })
    ]);

    let transformedBooks = books.map((book) => this.transformBookWithAvailability(book));

    // Filter by availability (done after query since we need to calculate availability)
    if (query.available_only) {
      transformedBooks = transformedBooks.filter((book) => book.available_copies > 0);
    }

    // Sort by rating (done after query since we need to calculate rating)
    if (query.sort_by === 'rating') {
      transformedBooks.sort((a, b) => {
        if (a.average_rating === null && b.average_rating === null) return 0;
        if (a.average_rating === null) return 1;
        if (b.average_rating === null) return -1;
        return b.average_rating - a.average_rating;
      });
    }

    return { books: transformedBooks, total };
  }

  public async getBookById(book_id: string) {
    const book = await this.prisma.book.findUnique({
      where: { book_id },
      select: this.getBookSelect()
    });

    if (!book) {
      throw httpErrors.notFound('Book not found');
    }

    return this.transformBookWithAvailability(book);
  }

  public async getNewBooks(limit: number = 8) {
    const books = await this.prisma.book.findMany({
      take: limit,
      orderBy: {
        created_at: 'desc'
      },
      select: this.getBookSelect()
    });

    return books.map((book) => this.transformBookWithAvailability(book));
  }
}
