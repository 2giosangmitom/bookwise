import StaffBookCloneService from '@/modules/staff/book_clone/services';
import { buildMockFastify } from '../../../helpers/mockFastify';
import { faker } from '@faker-js/faker';
import { BookCondition, Prisma } from '@/generated/prisma/client';

describe('StaffBookCloneService', async () => {
  const app = await buildMockFastify();
  const service = new StaffBookCloneService({ prisma: app.prisma });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('createBookClone', () => {
    it('should call prisma.book_Clone.create with correct data', async () => {
      const data = {
        book_id: faker.string.uuid(),
        location_id: faker.string.alphanumeric(10),
        barcode: faker.string.alphanumeric(10),
        condition: BookCondition.NEW
      };

      const mockCreatedBookClone = {
        book_clone_id: faker.string.uuid(),
        ...data,
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      };

      vi.mocked(app.prisma.book_Clone.create).mockResolvedValueOnce(
        mockCreatedBookClone as unknown as Awaited<ReturnType<typeof app.prisma.book_Clone.create>>
      );

      const result = await service.createBookClone(data);

      expect(app.prisma.book_Clone.create).toHaveBeenCalledWith({
        data: {
          book_id: data.book_id,
          location_id: data.location_id,
          barcode: data.barcode,
          condition: data.condition
        }
      });

      expect(result).toEqual(mockCreatedBookClone);
    });

    it('should throw conflict error if barcode already exists', async () => {
      const data = {
        book_id: faker.string.uuid(),
        location_id: faker.string.alphanumeric(10),
        barcode: faker.string.alphanumeric(10),
        condition: BookCondition.NEW
      };

      vi.mocked(app.prisma.book_Clone.create).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.createBookClone(data)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[ConflictError: Book clone with the given barcode already exists.]`
      );
    });

    it('should throw bad request error for foreign key constraint violation', async () => {
      const data = {
        book_id: faker.string.uuid(),
        location_id: faker.string.alphanumeric(10),
        barcode: faker.string.alphanumeric(10),
        condition: BookCondition.GOOD
      };

      vi.mocked(app.prisma.book_Clone.create).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
          code: 'P2003',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.createBookClone(data)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[BadRequestError: Invalid book_id or location_id provided.]`
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const data = {
        book_id: faker.string.uuid(),
        location_id: faker.string.alphanumeric(10),
        barcode: faker.string.alphanumeric(10),
        condition: BookCondition.WORN
      };

      vi.mocked(app.prisma.book_Clone.create).mockRejectedValueOnce(new Error('Some other error'));

      await expect(service.createBookClone(data)).rejects.toThrowError('Some other error');
    });

    it('should return created book clone on success', async () => {
      const data = {
        book_id: faker.string.uuid(),
        location_id: faker.string.alphanumeric(10),
        barcode: faker.string.alphanumeric(10),
        condition: BookCondition.DAMAGED
      };

      const mockCreatedBookClone = {
        book_clone_id: faker.string.uuid(),
        ...data,
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      };

      vi.mocked(app.prisma.book_Clone.create).mockResolvedValueOnce(
        mockCreatedBookClone as unknown as Awaited<ReturnType<typeof app.prisma.book_Clone.create>>
      );

      const result = await service.createBookClone(data);

      expect(result).toEqual(
        expect.objectContaining({
          book_clone_id: expect.any(String),
          book_id: data.book_id,
          location_id: data.location_id,
          barcode: data.barcode,
          condition: data.condition,
          created_at: expect.any(Date),
          updated_at: expect.any(Date)
        })
      );
    });

    it('should handle all condition types', async () => {
      for (const condition of Object.values(BookCondition)) {
        const data = {
          book_id: faker.string.uuid(),
          location_id: faker.string.alphanumeric(10),
          barcode: faker.string.alphanumeric(10),
          condition
        };

        const mockCreatedBookClone = {
          book_clone_id: faker.string.uuid(),
          ...data,
          created_at: faker.date.anytime(),
          updated_at: faker.date.anytime()
        };

        vi.mocked(app.prisma.book_Clone.create).mockResolvedValueOnce(
          mockCreatedBookClone as unknown as Awaited<ReturnType<typeof app.prisma.book_Clone.create>>
        );

        const result = await service.createBookClone(data);

        expect(result.condition).toBe(condition);
        vi.clearAllMocks();
      }
    });
  });

  describe('deleteBookClone', () => {
    it('should call prisma.book_Clone.delete with correct book_clone_id', async () => {
      const id = faker.string.uuid();
      const mockDeleted = {
        book_clone_id: id,
        barcode: faker.string.alphanumeric(10)
      };

      vi.mocked(app.prisma.book_Clone.delete).mockResolvedValueOnce(
        mockDeleted as unknown as Awaited<ReturnType<typeof app.prisma.book_Clone.delete>>
      );

      await service.deleteBookClone(id);

      expect(app.prisma.book_Clone.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { book_clone_id: id } })
      );
    });

    it('should throw not found error when book clone does not exist', async () => {
      const id = faker.string.uuid();

      vi.mocked(app.prisma.book_Clone.delete).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.deleteBookClone(id)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[NotFoundError: Book clone with the given ID does not exist.]`
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const id = faker.string.uuid();

      vi.mocked(app.prisma.book_Clone.delete).mockRejectedValueOnce(new Error('Some other error'));

      await expect(service.deleteBookClone(id)).rejects.toThrowError('Some other error');
    });

    it('should return deleted book clone on success', async () => {
      const id = faker.string.uuid();
      const mockDeleted = {
        book_clone_id: id,
        barcode: faker.string.alphanumeric(10)
      };

      vi.mocked(app.prisma.book_Clone.delete).mockResolvedValueOnce(
        mockDeleted as unknown as Awaited<ReturnType<typeof app.prisma.book_Clone.delete>>
      );

      const result = await service.deleteBookClone(id);

      expect(result).toEqual(
        expect.objectContaining({
          book_clone_id: id,
          barcode: expect.any(String)
        })
      );
    });
  });

  describe('updateBookClone', () => {
    it('should call prisma.book_Clone.update with correct data', async () => {
      const book_clone_id = faker.string.uuid();
      const data = {
        book_id: faker.string.uuid(),
        location_id: faker.string.alphanumeric(10),
        barcode: faker.string.alphanumeric(10),
        condition: BookCondition.GOOD
      };

      await service.updateBookClone(book_clone_id, data);

      expect(app.prisma.book_Clone.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { book_clone_id },
          data: {
            book_id: data.book_id,
            location_id: data.location_id,
            barcode: data.barcode,
            condition: data.condition
          }
        })
      );
    });

    it('should throw not found error if book clone does not exist', async () => {
      const book_clone_id = faker.string.uuid();
      const data = {
        book_id: faker.string.uuid(),
        location_id: faker.string.alphanumeric(10),
        barcode: faker.string.alphanumeric(10),
        condition: BookCondition.NEW
      };

      vi.mocked(app.prisma.book_Clone.update).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.updateBookClone(book_clone_id, data)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[NotFoundError: Book clone with the given ID does not exist.]`
      );
    });

    it('should throw conflict error if barcode already exists', async () => {
      const book_clone_id = faker.string.uuid();
      const data = {
        book_id: faker.string.uuid(),
        location_id: faker.string.alphanumeric(10),
        barcode: faker.string.alphanumeric(10),
        condition: BookCondition.WORN
      };

      vi.mocked(app.prisma.book_Clone.update).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.updateBookClone(book_clone_id, data)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[ConflictError: Book clone with the given barcode already exists.]`
      );
    });

    it('should throw bad request error for foreign key constraint violation', async () => {
      const book_clone_id = faker.string.uuid();
      const data = {
        book_id: faker.string.uuid(),
        location_id: faker.string.alphanumeric(10),
        barcode: faker.string.alphanumeric(10),
        condition: BookCondition.DAMAGED
      };

      vi.mocked(app.prisma.book_Clone.update).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
          code: 'P2003',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.updateBookClone(book_clone_id, data)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[BadRequestError: Invalid book_id or location_id provided.]`
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const book_clone_id = faker.string.uuid();
      const data = {
        book_id: faker.string.uuid(),
        location_id: faker.string.alphanumeric(10),
        barcode: faker.string.alphanumeric(10),
        condition: BookCondition.NEW
      };

      vi.mocked(app.prisma.book_Clone.update).mockRejectedValueOnce(new Error('Some other error'));

      await expect(service.updateBookClone(book_clone_id, data)).rejects.toThrowError('Some other error');
    });

    it('should return updated book clone on success', async () => {
      const book_clone_id = faker.string.uuid();
      const data = {
        book_id: faker.string.uuid(),
        location_id: faker.string.alphanumeric(10),
        barcode: faker.string.alphanumeric(10),
        condition: BookCondition.GOOD
      };

      const mockUpdated = {
        book_clone_id,
        ...data,
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      };

      vi.mocked(app.prisma.book_Clone.update).mockResolvedValueOnce(
        mockUpdated as unknown as Awaited<ReturnType<typeof app.prisma.book_Clone.update>>
      );

      const result = await service.updateBookClone(book_clone_id, data);

      expect(result).toEqual(
        expect.objectContaining({
          book_clone_id,
          book_id: data.book_id,
          location_id: data.location_id,
          barcode: data.barcode,
          condition: data.condition,
          created_at: expect.any(Date),
          updated_at: expect.any(Date)
        })
      );
    });
  });

  describe('getBookClones', () => {
    it('should apply filters correctly', async () => {
      const query = {
        page: 1,
        limit: 10,
        book_id: faker.string.uuid(),
        location_id: faker.string.alphanumeric(10),
        condition: BookCondition.NEW,
        barcode: faker.string.alphanumeric(10),
        is_available: true
      };

      vi.mocked(app.prisma.book_Clone.findMany).mockResolvedValueOnce([]);
      vi.mocked(app.prisma.book_Clone.count).mockResolvedValueOnce(0);

      await service.getBookClones(query);

      expect(app.prisma.book_Clone.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            book_id: query.book_id,
            location_id: query.location_id,
            condition: query.condition,
            barcode: query.barcode,
            OR: [{ loan: { is: null } }, { loan: { is: { status: 'RETURNED' } } }]
          }
        })
      );
    });

    it('should handle is_available: false filter', async () => {
      const query = {
        page: 1,
        limit: 10,
        is_available: false
      };

      vi.mocked(app.prisma.book_Clone.findMany).mockResolvedValueOnce([]);
      vi.mocked(app.prisma.book_Clone.count).mockResolvedValueOnce(0);

      await service.getBookClones(query);

      expect(app.prisma.book_Clone.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            loan: { is: { status: { not: 'RETURNED' } } }
          }
        })
      );
    });

    it('should handle query with no filters', async () => {
      const query = { page: 1, limit: 10 };

      vi.mocked(app.prisma.book_Clone.findMany).mockResolvedValueOnce([]);
      vi.mocked(app.prisma.book_Clone.count).mockResolvedValueOnce(0);

      await service.getBookClones(query);

      expect(app.prisma.book_Clone.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {}
        })
      );
    });
  });
});
