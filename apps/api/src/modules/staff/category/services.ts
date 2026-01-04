import type { PrismaClient } from '@/generated/prisma/client';
import { Prisma } from '@/generated/prisma/client';
import { httpErrors } from '@fastify/sensible';

export default class StaffCategoryService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  public async createCategory(data: { name: string; slug: string }) {
    try {
      const created = await this.prisma.category.create({
        data: {
          ...data
        }
      });

      return created;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw httpErrors.conflict('Category with the given slug already exists.');
        }
      }
      throw error;
    }
  }

  public async deleteCategory(category_id: string) {
    try {
      const deleted = await this.prisma.category.delete({
        where: { category_id },
        select: { category_id: true, name: true }
      });

      return deleted;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw httpErrors.notFound('Category with the given ID does not exist.');
        }
      }
      throw error;
    }
  }

  public async updateCategory(category_id: string, data: { name?: string; slug?: string }) {
    try {
      const updated = await this.prisma.category.update({
        where: { category_id },
        data: {
          ...data
        }
      });

      return updated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw httpErrors.notFound('Category with the given ID does not exist.');
        }
        if (error.code === 'P2002') {
          throw httpErrors.conflict('Category with the given slug already exists.');
        }
      }
      throw error;
    }
  }

  public async getCategories(query: { page: number; limit: number; searchTerm?: string }) {
    const where: Prisma.CategoryWhereInput = query.searchTerm
      ? {
          OR: [
            { name: { contains: query.searchTerm, mode: 'insensitive' } },
            { slug: { contains: query.searchTerm, mode: 'insensitive' } }
          ]
        }
      : {};

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ created_at: 'desc' }],
        select: {
          category_id: true,
          name: true,
          slug: true,
          created_at: true,
          updated_at: true
        }
      }),
      this.prisma.category.count({ where })
    ]);

    return { categories, total };
  }

  public async getKPopularCategories(k: number) {
    const categories = await this.prisma.$queryRaw<
      {
        category_id: string;
        name: string;
        slug: string;
        loan_count: number;
      }[]
    >`
      SELECT
        c.category_id,
        c.name,
        c.slug,
        COUNT(bl.loan_id) AS loan_count
      FROM
        "Category" c
      INNER JOIN
        "Book_Category" bc ON c.category_id = bc.category_id
      INNER JOIN
        "Book_Clone" bc2 ON bc.book_id = bc2.book_id
      INNER JOIN
        "Loan" bl ON bc2.book_clone_id = bl.book_clone_id
      GROUP BY
        c.category_id
      ORDER BY
        loan_count DESC
      LIMIT ${k};
    `;

    const totalLoansResult = await this.prisma.$queryRaw<{ total_loans: number }[]>`
      SELECT COUNT(*) AS total_loans FROM "Loan";
    `;
    const totalLoans = totalLoansResult[0]?.total_loans || 0;

    return { categories, total_loans: totalLoans };
  }
}
