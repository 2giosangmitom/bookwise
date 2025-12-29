import StaffCategoryService from '@/modules/staff/category/services';
import { buildMockFastify } from '../../../helpers/mockFastify';
import { faker } from '@faker-js/faker';
import { Prisma } from '@/generated/prisma/client';

describe('StaffCategoryService', async () => {
  const app = await buildMockFastify();
  const service = new StaffCategoryService({ prisma: app.prisma });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should call prisma.category.create with correct data', async () => {
      const data = { name: faker.lorem.word(), slug: faker.lorem.slug() };

      await service.createCategory(data);

      expect(app.prisma.category.create).toHaveBeenCalledWith(expect.objectContaining({ data: { ...data } }));
    });

    it('should throw conflict error if slug already exists', async () => {
      const data = { name: faker.lorem.word(), slug: faker.lorem.slug() };

      vi.mocked(app.prisma.category.create).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.createCategory(data)).rejects.toThrowErrorMatchingInlineSnapshot(
        `
        [ConflictError: Category with the given slug already exists.]
      `
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const data = { name: faker.lorem.word(), slug: faker.lorem.slug() };

      vi.mocked(app.prisma.category.create).mockRejectedValueOnce(new Error('Some other error'));

      await expect(service.createCategory(data)).rejects.toThrowError('Some other error');
    });

    it('should return created category on success', async () => {
      const data = { name: faker.lorem.word(), slug: faker.lorem.slug() };

      vi.mocked(app.prisma.category.create).mockResolvedValueOnce({
        ...data,
        category_id: faker.string.uuid(),
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      });

      const res = await service.createCategory(data);

      expect(res).toEqual(
        expect.objectContaining({
          ...data,
          category_id: expect.any(String),
          created_at: expect.any(Date),
          updated_at: expect.any(Date)
        })
      );
    });
  });

  describe('deleteCategory', () => {
    it('should call prisma.category.delete with correct id', async () => {
      const id = faker.string.uuid();

      await service.deleteCategory(id);

      expect(app.prisma.category.delete).toHaveBeenCalledWith(expect.objectContaining({ where: { category_id: id } }));
    });

    it('should return deleted category', async () => {
      const id = faker.string.uuid();
      const deleted = { category_id: id, name: faker.lorem.word() } as unknown as Awaited<
        ReturnType<typeof app.prisma.category.delete>
      >;

      vi.mocked(app.prisma.category.delete).mockResolvedValueOnce(deleted);

      const res = await service.deleteCategory(id);
      expect(res).toEqual(deleted);
    });

    it("should throw 404 if category doesn't exist", async () => {
      const id = faker.string.uuid();

      vi.mocked(app.prisma.category.delete).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.deleteCategory(id)).rejects.toThrowErrorMatchingInlineSnapshot(
        `
        [NotFoundError: Category with the given ID does not exist.]
      `
      );
    });

    it('should rethrow other errors', async () => {
      const id = faker.string.uuid();

      vi.mocked(app.prisma.category.delete).mockRejectedValueOnce(new Error('Some other error'));

      await expect(service.deleteCategory(id)).rejects.toThrowError('Some other error');
    });
  });

  describe('updateCategory', () => {
    it('should call prisma.category.update with correct data', async () => {
      const id = faker.string.uuid();
      const data = { name: faker.lorem.word() };

      await service.updateCategory(id, data);

      expect(app.prisma.category.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { category_id: id }, data: { ...data } })
      );
    });

    it('should return updated category', async () => {
      const id = faker.string.uuid();
      const data = { name: faker.lorem.word() };
      const updated = { category_id: id, ...data } as unknown as Awaited<ReturnType<typeof app.prisma.category.update>>;

      vi.mocked(app.prisma.category.update).mockResolvedValueOnce(updated);

      const res = await service.updateCategory(id, data);
      expect(res).toEqual(updated);
    });

    it("should throw 404 if category doesn't exist", async () => {
      const id = faker.string.uuid();
      const data = { name: faker.lorem.word() };

      vi.mocked(app.prisma.category.update).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.updateCategory(id, data)).rejects.toThrowErrorMatchingInlineSnapshot(
        `
        [NotFoundError: Category with the given ID does not exist.]
      `
      );
    });

    it('should rethrow other errors', async () => {
      const id = faker.string.uuid();
      const data = { name: faker.lorem.word() };

      vi.mocked(app.prisma.category.update).mockRejectedValueOnce(new Error('Some other error'));

      await expect(service.updateCategory(id, data)).rejects.toThrowError('Some other error');
    });
  });

  describe('getCategories', () => {
    it('should fetch paginated categories with filters', async () => {
      const categories = [
        {
          category_id: faker.string.uuid(),
          name: 'Fiction',
          slug: 'fiction',
          created_at: faker.date.anytime(),
          updated_at: faker.date.anytime()
        }
      ];

      const expectedWhere = {
        AND: [{ name: { contains: 'fic', mode: 'insensitive' } }, { slug: { contains: 'fic', mode: 'insensitive' } }]
      };

      vi.mocked(app.prisma.category.findMany).mockResolvedValueOnce(
        categories as unknown as Awaited<ReturnType<typeof app.prisma.category.findMany>>
      );
      vi.mocked(app.prisma.category.count).mockResolvedValueOnce(categories.length);

      const result = await service.getCategories({ page: 2, limit: 1, name: 'fic', slug: 'fic' });

      expect(app.prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
          skip: 1,
          take: 1,
          orderBy: [
            {
              created_at: 'desc'
            },
            { category_id: 'asc' }
          ],
          select: {
            category_id: true,
            name: true,
            slug: true,
            created_at: true,
            updated_at: true
          }
        })
      );
      expect(app.prisma.category.count).toHaveBeenCalledWith({ where: expectedWhere });
      expect(result).toEqual({ categories, total: categories.length });
    });

    it('should handle empty filters', async () => {
      const categories: Awaited<ReturnType<typeof app.prisma.category.findMany>> = [] as unknown as Awaited<
        ReturnType<typeof app.prisma.category.findMany>
      >;

      vi.mocked(app.prisma.category.findMany).mockResolvedValueOnce(categories);
      vi.mocked(app.prisma.category.count).mockResolvedValueOnce(0);

      const result = await service.getCategories({ page: 1, limit: 10 });

      expect(app.prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          skip: 0,
          take: 10
        })
      );
      expect(app.prisma.category.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual({ categories, total: 0 });
    });
  });
});
