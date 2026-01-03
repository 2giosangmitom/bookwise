import PublisherService from '../../../../src/modules/publisher/services';
import { buildMockFastify } from '../../helpers/mockFastify';

describe('PublisherService', async () => {
  const app = await buildMockFastify();
  const service = new PublisherService({ prisma: app.prisma });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('getPublisherBySlug', () => {
    it('should call prisma.publisher.findUnique with correct slug', async () => {
      vi.mocked(app.prisma.publisher.findUnique).mockResolvedValueOnce(
        {} as unknown as Awaited<ReturnType<typeof app.prisma.publisher.findUnique>>
      );

      await service.getPublisherBySlug('test-publisher');

      expect(app.prisma.publisher.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-publisher' }
      });
    });

    it('should return publisher when found', async () => {
      const mockPublisher = {
        publisher_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Publisher',
        website: 'https://testpublisher.com',
        slug: 'test-publisher',
        image_url: null,
        created_at: new Date(),
        updated_at: new Date()
      } as unknown as Awaited<ReturnType<typeof app.prisma.publisher.findUnique>>;

      vi.mocked(app.prisma.publisher.findUnique).mockResolvedValueOnce(mockPublisher);

      const result = await service.getPublisherBySlug('test-publisher');

      expect(result).toEqual(mockPublisher);
    });

    it('should throw 404 error if publisher does not exist', async () => {
      vi.mocked(app.prisma.publisher.findUnique).mockResolvedValueOnce(null);

      await expect(service.getPublisherBySlug('nonexistent')).rejects.toThrowErrorMatchingInlineSnapshot(
        `[NotFoundError: Publisher with the given slug does not exist.]`
      );
    });
  });
});
