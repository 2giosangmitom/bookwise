import type { PrismaClient } from '@/generated/prisma/client';
import { httpErrors } from '@fastify/sensible';

export default class CategoryService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  public async getCategories(page: number, limit: number) {
    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          category_id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              books: true
            }
          }
        }
      }),
      this.prisma.category.count()
    ]);

    return {
      categories: categories.map((cat) => ({
        category_id: cat.category_id,
        name: cat.name,
        slug: cat.slug,
        book_count: cat._count.books
      })),
      total
    };
  }

  public async getCategoryBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      select: {
        category_id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            books: true
          }
        }
      }
    });

    if (!category) {
      throw httpErrors.notFound('Category not found');
    }

    return {
      category_id: category.category_id,
      name: category.name,
      slug: category.slug,
      book_count: category._count.books
    };
  }
}
