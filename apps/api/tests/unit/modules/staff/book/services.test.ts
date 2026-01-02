import StaffBookService from '@/modules/staff/book/services';
import { buildMockFastify } from '../../../helpers/mockFastify';
import { faker } from '@faker-js/faker';
import { Prisma } from '@/generated/prisma/client';

describe('StaffBookService', async () => {
  const app = await buildMockFastify();
  const service = new StaffBookService({ prisma: app.prisma });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('createBook', () => {
    it('should call prisma.book.create with correct data', async () => {
      const data = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null,
        authors: undefined,
        categories: undefined
      };

      await service.createBook(data);

      expect(app.prisma.book.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: data.title,
            description: data.description,
            isbn: data.isbn
          })
        })
      );
    });

    it('should throw conflict error if isbn already exists', async () => {
      const data = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null
      };

      vi.mocked(app.prisma.book.create).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.createBook(data)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[ConflictError: Book with the given ISBN already exists.]`
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const data = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null
      };

      vi.mocked(app.prisma.book.create).mockRejectedValueOnce(new Error('Some other error'));

      await expect(service.createBook(data)).rejects.toThrowError('Some other error');
    });

    it('should return created book on success', async () => {
      const data = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null
      };

      vi.mocked(app.prisma.book.create).mockResolvedValueOnce({
        ...data,
        book_id: faker.string.uuid(),
        published_at: new Date(data.published_at),
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      } as unknown as Awaited<ReturnType<typeof app.prisma.book.create>>);

      const result = await service.createBook(data);

      expect(result).toEqual(
        expect.objectContaining({
          ...data,
          book_id: expect.any(String),
          published_at: expect.any(Date),
          created_at: expect.any(Date),
          updated_at: expect.any(Date)
        })
      );
    });
  });

  describe('deleteBook', () => {
    it('should call prisma.book.delete with correct book_id', async () => {
      const id = faker.string.uuid();

      await service.deleteBook(id);

      expect(app.prisma.book.delete).toHaveBeenCalledWith(expect.objectContaining({ where: { book_id: id } }));
    });

    it('should create relations when authors and categories provided', async () => {
      const data = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null,
        authors: [faker.string.uuid(), faker.string.uuid()],
        categories: [faker.string.uuid()]
      };

      vi.mocked(app.prisma.book.create).mockResolvedValueOnce({
        ...data,
        book_id: faker.string.uuid(),
        published_at: new Date(data.published_at),
        authors: data.authors.map((author_id) => ({ author_id })),
        categories: data.categories.map((category_id) => ({ category_id })),
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      } as unknown as Awaited<ReturnType<typeof app.prisma.book.create>>);

      const result = await service.createBook(data);

      expect(app.prisma.book.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            authors: expect.objectContaining({
              create: expect.arrayContaining([expect.objectContaining({ author_id: data.authors[0] })])
            }),
            categories: expect.objectContaining({
              create: expect.arrayContaining([expect.objectContaining({ category_id: data.categories[0] })])
            })
          })
        })
      );

      expect(result).toEqual(
        expect.objectContaining({
          book_id: expect.any(String),
          authors: expect.any(Array),
          categories: expect.any(Array)
        })
      );
    });

    it('should return deleted book', async () => {
      const id = faker.string.uuid();
      const deleted = { book_id: id, title: faker.lorem.sentence() } as unknown as Awaited<
        ReturnType<typeof app.prisma.book.delete>
      >;

      vi.mocked(app.prisma.book.delete).mockResolvedValueOnce(deleted);

      const result = await service.deleteBook(id);

      expect(result).toEqual(deleted);
    });

    it("should throw 404 error if book doesn't exist", async () => {
      const id = faker.string.uuid();

      vi.mocked(app.prisma.book.delete).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.deleteBook(id)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[NotFoundError: Book with the given ID does not exist.]`
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const id = faker.string.uuid();

      vi.mocked(app.prisma.book.delete).mockRejectedValueOnce(new Error('Some other error'));

      await expect(service.deleteBook(id)).rejects.toThrowError('Some other error');
    });
  });

  describe('updateBook', () => {
    it('should call prisma.book.update with correct data', async () => {
      const bookId = faker.string.uuid();
      const bookData = {
        title: faker.book.title(),
        description: faker.word.words(5),
        isbn: faker.book.series(),
        published_at: faker.date.anytime().toISOString(),
        publisher_id: faker.book.publisher(),
        authors: Array.from({ length: 5 }, () => faker.string.uuid()),
        categories: Array.from({ length: 5 }, () => faker.string.uuid())
      };

      await service.updateBook(bookId, bookData);

      expect(app.prisma.book.update).toBeCalledWith(
        expect.objectContaining({
          data: {
            title: bookData.title,
            description: bookData.description,
            isbn: bookData.isbn,
            published_at: bookData.published_at,
            publisher_id: bookData.publisher_id,
            authors: expect.objectContaining({
              create: bookData.authors.map((author_id) => ({ author_id }))
            }),
            categories: expect.objectContaining({
              create: bookData.categories.map((category_id) => ({ category_id }))
            })
          },
          where: {
            book_id: bookId
          }
        })
      );
    });

    it('should throw not found error if the book does not exist', async () => {
      vi.mocked(app.prisma.book.update).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Not found', {
          code: 'P2025',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(
        service.updateBook(faker.string.uuid(), {
          title: faker.book.title(),
          description: faker.word.words(5),
          isbn: faker.book.series(),
          published_at: faker.date.anytime().toISOString(),
          publisher_id: faker.book.publisher(),
          authors: Array.from({ length: 5 }, () => faker.string.uuid())
        })
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[NotFoundError: Book with the given ID does not exist.]`);
    });

    it('should throw conflict error if the isbn already exist', async () => {
      vi.mocked(app.prisma.book.update).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Conflict', {
          code: 'P2002',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(
        service.updateBook(faker.string.uuid(), {
          title: faker.book.title(),
          description: faker.word.words(5),
          isbn: faker.book.series(),
          published_at: faker.date.anytime().toISOString(),
          publisher_id: faker.book.publisher(),
          authors: Array.from({ length: 5 }, () => faker.string.uuid())
        })
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[ConflictError: Book with the given ISBN already exists.]`);
    });

    it('should rethrow other errors', async () => {
      vi.mocked(app.prisma.book.update).mockRejectedValueOnce(new Error('Unknown'));

      await expect(
        service.updateBook(faker.string.uuid(), {
          title: faker.book.title(),
          description: faker.word.words(5),
          isbn: faker.book.series(),
          published_at: faker.date.anytime().toISOString(),
          publisher_id: faker.book.publisher(),
          authors: Array.from({ length: 5 }, () => faker.string.uuid())
        })
      ).rejects.toThrowError('Unknown');
    });
  });

  describe('getBooks', () => {
    it('should call prisma.book.findMany with correct pagination parameters', async () => {
      const query = { page: 1, limit: 10, searchTerm: undefined };

      await service.getBooks(query);

      expect(app.prisma.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          where: {},
          orderBy: [
            {
              created_at: 'desc'
            }
          ]
        })
      );
    });

    it('should apply searchTerm filter with OR logic across title, isbn, and description', async () => {
      const query = { page: 1, limit: 10, searchTerm: 'Great Gatsby' };

      await service.getBooks(query);

      expect(app.prisma.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { title: { contains: 'Great Gatsby', mode: 'insensitive' } },
              { isbn: { contains: 'Great Gatsby', mode: 'insensitive' } },
              { description: { contains: 'Great Gatsby', mode: 'insensitive' } }
            ]
          }
        })
      );
    });

    it('should select publisher name in the query', async () => {
      const query = { page: 1, limit: 10, searchTerm: undefined };

      await service.getBooks(query);

      expect(app.prisma.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            publisher: {
              select: { name: true }
            }
          })
        })
      );
    });

    it('should select author details (id and name) in the query', async () => {
      const query = { page: 1, limit: 10, searchTerm: undefined };

      await service.getBooks(query);

      expect(app.prisma.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            authors: {
              select: {
                author: {
                  select: {
                    author_id: true,
                    name: true
                  }
                }
              }
            }
          })
        })
      );
    });

    it('should select category details (id and name) in the query', async () => {
      const query = { page: 1, limit: 10, searchTerm: undefined };

      await service.getBooks(query);

      expect(app.prisma.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
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
          })
        })
      );
    });

    it('should fetch books and count with searchTerm filter', async () => {
      const query = { page: 1, limit: 10, searchTerm: 'search' };

      vi.mocked(app.prisma.book.findMany).mockResolvedValueOnce([]);
      vi.mocked(app.prisma.book.count).mockResolvedValueOnce(0);

      await service.getBooks(query);

      expect(app.prisma.book.findMany).toHaveBeenCalled();
      expect(app.prisma.book.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'search', mode: 'insensitive' } },
            { isbn: { contains: 'search', mode: 'insensitive' } },
            { description: { contains: 'search', mode: 'insensitive' } }
          ]
        }
      });
    });

    it('should return books with publisher and authors, and total count', async () => {
      const mockBooks = [
        {
          book_id: faker.string.uuid(),
          title: faker.lorem.sentence(),
          description: faker.lorem.paragraphs(2),
          isbn: faker.string.numeric(13),
          published_at: faker.date.past(),
          publisher_id: faker.string.uuid(),
          image_url: null,
          created_at: new Date(),
          updated_at: new Date(),
          publisher: { name: 'Test Publisher' },
          authors: [
            {
              author: {
                author_id: faker.string.uuid(),
                name: 'Test Author'
              }
            }
          ],
          categories: [
            {
              category: {
                category_id: faker.string.uuid(),
                name: 'Test Category'
              }
            }
          ]
        }
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(app.prisma.book.findMany).mockResolvedValueOnce(mockBooks as any);
      vi.mocked(app.prisma.book.count).mockResolvedValueOnce(1);

      const query = { page: 1, limit: 10, searchTerm: undefined };
      const result = await service.getBooks(query);

      expect(result).toEqual({
        books: mockBooks,
        total: 1
      });
    });

    it('should handle empty results', async () => {
      vi.mocked(app.prisma.book.findMany).mockResolvedValueOnce([]);
      vi.mocked(app.prisma.book.count).mockResolvedValueOnce(0);

      const query = { page: 1, limit: 10, searchTerm: undefined };
      const result = await service.getBooks(query);

      expect(result).toEqual({
        books: [],
        total: 0
      });
    });
  });
});
