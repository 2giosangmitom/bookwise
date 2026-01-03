import AuthorService from '@/modules/author/services';
import { buildMockFastify } from '../../helpers/mockFastify';
import { faker } from '@faker-js/faker';

describe('AuthorService', async () => {
  const app = await buildMockFastify();
  const authorService = new AuthorService({ prisma: app.prisma });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('getAuthorBySlug', () => {
    it('should call prisma.author.findUnique with correct slug', async () => {
      const slug = faker.lorem.slug();

      vi.mocked(app.prisma.author.findUnique).mockResolvedValueOnce(
        {} as unknown as Awaited<ReturnType<typeof app.prisma.author.findUnique>> // Prevent undefined return
      );
      await authorService.getAuthorBySlug(slug);

      expect(app.prisma.author.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            slug
          }
        })
      );
    });

    it('should return the author if found', async () => {
      const slug = faker.lorem.slug();
      const author = {
        author_id: faker.string.uuid(),
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(2),
        date_of_birth: faker.date.past(),
        date_of_death: null,
        slug,
        nationality: faker.location.country(),
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime(),
        image_url: null
      } as unknown as Awaited<ReturnType<typeof app.prisma.author.findUnique>>;

      // Mock Prisma to return the author
      vi.mocked(app.prisma.author.findUnique).mockResolvedValueOnce(author);

      const result = await authorService.getAuthorBySlug(slug);

      expect(result).toEqual(author);
    });

    it("should throw 404 error if author with given slug doesn't exist", async () => {
      const slug = faker.lorem.slug();

      // Mock Prisma to return null (not found)
      vi.mocked(app.prisma.author.findUnique).mockResolvedValueOnce(null);

      await expect(authorService.getAuthorBySlug(slug)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[NotFoundError: Author with the given slug does not exist.]`
      );
    });
  });
});
