import StaffPublisherService from '@/modules/staff/publisher/services';
import { buildMockFastify } from '../../../helpers/mockFastify';
import { faker } from '@faker-js/faker';
import { Prisma } from '@/generated/prisma/client';

describe('StaffPublisherService', async () => {
  const app = await buildMockFastify();
  const service = new StaffPublisherService({ prisma: app.prisma });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('createPublisher', () => {
    it('should call prisma.publisher.create with correct data', async () => {
      const data = {
        name: faker.company.name(),
        website: 'https://example.com',
        slug: faker.lorem.slug()
      };

      await service.createPublisher(data);

      expect(app.prisma.publisher.create).toHaveBeenCalledWith(expect.objectContaining({ data: { ...data } }));
    });

    it('should throw conflict error if slug already exists', async () => {
      const data = {
        name: faker.company.name(),
        website: 'https://example.com',
        slug: faker.lorem.slug()
      };

      vi.mocked(app.prisma.publisher.create).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.createPublisher(data)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[ConflictError: Publisher with the given slug already exists.]`
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const data = {
        name: faker.company.name(),
        website: 'https://example.com',
        slug: faker.lorem.slug()
      };

      vi.mocked(app.prisma.publisher.create).mockRejectedValueOnce(new Error('Some other error'));

      await expect(service.createPublisher(data)).rejects.toThrowError('Some other error');
    });

    it('should return created publisher on success', async () => {
      const data = {
        name: faker.company.name(),
        website: 'https://example.com',
        slug: faker.lorem.slug()
      };

      vi.mocked(app.prisma.publisher.create).mockResolvedValueOnce({
        ...data,
        publisher_id: faker.string.uuid(),
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      } as unknown as Awaited<ReturnType<typeof app.prisma.publisher.create>>);

      const result = await service.createPublisher(data);

      expect(result).toEqual(
        expect.objectContaining({
          ...data,
          publisher_id: expect.any(String),
          created_at: expect.any(Date),
          updated_at: expect.any(Date)
        })
      );
    });
  });

  describe('deletePublisher', () => {
    it('should call prisma.publisher.delete with correct publisher_id', async () => {
      const id = faker.string.uuid();

      await service.deletePublisher(id);

      expect(app.prisma.publisher.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { publisher_id: id } })
      );
    });

    it('should return deleted publisher', async () => {
      const id = faker.string.uuid();
      const deleted = { publisher_id: id, name: faker.company.name() } as unknown as Awaited<
        ReturnType<typeof app.prisma.publisher.delete>
      >;

      vi.mocked(app.prisma.publisher.delete).mockResolvedValueOnce(deleted);

      const result = await service.deletePublisher(id);

      expect(result).toEqual(deleted);
    });

    it("should throw 404 error if publisher doesn't exist", async () => {
      const id = faker.string.uuid();

      vi.mocked(app.prisma.publisher.delete).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.deletePublisher(id)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[NotFoundError: Publisher with the given ID does not exist.]`
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const id = faker.string.uuid();

      vi.mocked(app.prisma.publisher.delete).mockRejectedValueOnce(new Error('Some other error'));

      await expect(service.deletePublisher(id)).rejects.toThrowError('Some other error');
    });
  });

  describe('updatePublisher', () => {
    it('should call prisma.publisher.update with correct data', async () => {
      const publisher_id = faker.string.uuid();
      const data = {
        name: faker.company.name(),
        website: 'https://example.com',
        slug: faker.lorem.slug()
      };

      await service.updatePublisher(publisher_id, data);

      expect(app.prisma.publisher.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { publisher_id },
          data: { ...data }
        })
      );
    });

    it('should throw not found error if publisher does not exist', async () => {
      const publisher_id = faker.string.uuid();
      const data = {
        name: faker.company.name(),
        website: 'https://example.com',
        slug: faker.lorem.slug()
      };

      vi.mocked(app.prisma.publisher.update).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.updatePublisher(publisher_id, data)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[NotFoundError: Publisher with the given ID does not exist.]`
      );
    });

    it('should throw conflict error if slug already exists', async () => {
      const publisher_id = faker.string.uuid();
      const data = {
        name: faker.company.name(),
        website: 'https://example.com',
        slug: faker.lorem.slug()
      };

      vi.mocked(app.prisma.publisher.update).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.updatePublisher(publisher_id, data)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[ConflictError: Publisher with the given slug already exists.]`
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const publisher_id = faker.string.uuid();
      const data = {
        name: faker.company.name(),
        website: 'https://example.com',
        slug: faker.lorem.slug()
      };

      vi.mocked(app.prisma.publisher.update).mockRejectedValueOnce(new Error('Some other error'));

      await expect(service.updatePublisher(publisher_id, data)).rejects.toThrowError('Some other error');
    });

    it('should return updated publisher on success', async () => {
      const publisher_id = faker.string.uuid();
      const data = {
        name: faker.company.name(),
        website: 'https://example.com',
        slug: faker.lorem.slug()
      };

      vi.mocked(app.prisma.publisher.update).mockResolvedValueOnce({
        publisher_id,
        ...data,
        image_url: null,
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      } as unknown as Awaited<ReturnType<typeof app.prisma.publisher.update>>);

      const result = await service.updatePublisher(publisher_id, data);

      expect(result).toEqual(
        expect.objectContaining({
          publisher_id,
          ...data,
          created_at: expect.any(Date),
          updated_at: expect.any(Date)
        })
      );
    });
  });

  describe('getPublishers', () => {
    it('should call prisma.publisher.findMany with correct pagination parameters', async () => {
      const query = { page: 1, limit: 10, name: undefined, website: undefined, slug: undefined };

      await service.getPublishers(query);

      expect(app.prisma.publisher.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          where: {}
        })
      );
    });

    it('should apply name filter correctly', async () => {
      const query = { page: 1, limit: 10, name: 'penguin', website: undefined, slug: undefined };

      await service.getPublishers(query);

      expect(app.prisma.publisher.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: { contains: 'penguin', mode: 'insensitive' } }
        })
      );
    });

    it('should apply website filter correctly', async () => {
      const query = { page: 1, limit: 10, name: undefined, website: 'penguin.com', slug: undefined };

      await service.getPublishers(query);

      expect(app.prisma.publisher.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { website: { contains: 'penguin.com', mode: 'insensitive' } }
        })
      );
    });

    it('should apply slug filter correctly', async () => {
      const query = { page: 1, limit: 10, name: undefined, website: undefined, slug: 'penguin-books' };

      await service.getPublishers(query);

      expect(app.prisma.publisher.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: { contains: 'penguin-books', mode: 'insensitive' } }
        })
      );
    });

    it('should combine multiple filters', async () => {
      const query = { page: 2, limit: 20, name: 'penguin', website: 'penguin.com', slug: 'penguin-books' };

      await service.getPublishers(query);

      expect(app.prisma.publisher.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 20,
          where: {
            name: { contains: 'penguin', mode: 'insensitive' },
            website: { contains: 'penguin.com', mode: 'insensitive' },
            slug: { contains: 'penguin-books', mode: 'insensitive' }
          }
        })
      );
    });

    it('should fetch publishers and count', async () => {
      const query = { page: 1, limit: 10, name: undefined, website: undefined, slug: undefined };

      vi.mocked(app.prisma.publisher.findMany).mockResolvedValueOnce([]);
      vi.mocked(app.prisma.publisher.count).mockResolvedValueOnce(0);

      await service.getPublishers(query);

      expect(app.prisma.publisher.findMany).toHaveBeenCalled();
      expect(app.prisma.publisher.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should return publishers and total count', async () => {
      const mockPublishers = [
        {
          publisher_id: faker.string.uuid(),
          name: faker.company.name(),
          website: 'https://example1.com',
          slug: faker.lorem.slug(),
          image_url: null,
          created_at: faker.date.anytime(),
          updated_at: faker.date.anytime()
        }
      ];

      vi.mocked(app.prisma.publisher.findMany).mockResolvedValueOnce(mockPublishers);
      vi.mocked(app.prisma.publisher.count).mockResolvedValueOnce(1);

      const query = { page: 1, limit: 10, name: undefined, website: undefined, slug: undefined };
      const result = await service.getPublishers(query);

      expect(result).toEqual({
        publishers: mockPublishers,
        total: 1
      });
    });

    it('should handle empty results', async () => {
      vi.mocked(app.prisma.publisher.findMany).mockResolvedValueOnce([]);
      vi.mocked(app.prisma.publisher.count).mockResolvedValueOnce(0);

      const query = { page: 1, limit: 10, name: undefined, website: undefined, slug: undefined };
      const result = await service.getPublishers(query);

      expect(result).toEqual({
        publishers: [],
        total: 0
      });
    });
  });
});
