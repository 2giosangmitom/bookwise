import { CreateBookSchema, DeleteBookSchema, UpdateBookSchema, GetBooksSchema } from './schemas';
import type StaffBookService from './services';
import { Prisma } from '@/generated/prisma/client';

export default class StaffBookController {
  private staffBookService: StaffBookService;

  public constructor({ staffBookService }: { staffBookService: StaffBookService }) {
    this.staffBookService = staffBookService;
  }

  public async createBook(
    req: FastifyRequestTypeBox<typeof CreateBookSchema>,
    reply: FastifyReplyTypeBox<typeof CreateBookSchema>
  ) {
    const { title, description, isbn, published_at, publisher_id, authors, categories } = req.body;
    type CreatedBook = Prisma.BookGetPayload<{
      include: {
        authors: { select: { author_id: true } };
        categories: { select: { category_id: true } };
      };
    }>;

    const createdBook: CreatedBook = await this.staffBookService.createBook({
      title,
      description,
      isbn,
      published_at,
      publisher_id,
      authors,
      categories
    });

    const responseData = {
      book_id: createdBook.book_id,
      title: createdBook.title,
      description: createdBook.description,
      isbn: createdBook.isbn,
      published_at: createdBook.published_at.toISOString(),
      publisher_id: createdBook.publisher_id ?? null,
      authors: createdBook.authors?.map((a) => a.author_id) ?? [],
      categories: createdBook.categories?.map((c) => c.category_id) ?? [],
      created_at: createdBook.created_at.toISOString(),
      updated_at: createdBook.updated_at.toISOString()
    } as const;

    return reply.status(201).send({ message: 'Book created successfully.', data: responseData });
  }

  public async deleteBook(
    req: FastifyRequestTypeBox<typeof DeleteBookSchema>,
    reply: FastifyReplyTypeBox<typeof DeleteBookSchema>
  ) {
    const { book_id } = req.params;

    const deleted = await this.staffBookService.deleteBook(book_id);

    return reply.status(200).send({
      message: 'Book deleted successfully',
      data: deleted
    });
  }

  public async updateBook(
    req: FastifyRequestTypeBox<typeof UpdateBookSchema>,
    reply: FastifyReplyTypeBox<typeof UpdateBookSchema>
  ) {
    const updated = await this.staffBookService.updateBook(req.params.book_id, req.body);

    return reply.status(200).send({
      message: 'Book updated successfully.',
      data: {
        ...updated,
        authors: updated.authors.map((author) => author.author_id),
        categories: updated.categories.map((category) => category.category_id),
        created_at: updated.created_at.toISOString(),
        updated_at: updated.updated_at.toISOString(),
        published_at: updated.published_at.toISOString()
      }
    });
  }

  public async getBooks(
    req: FastifyRequestTypeBox<typeof GetBooksSchema>,
    reply: FastifyReplyTypeBox<typeof GetBooksSchema>
  ) {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 10;

    const { books, total } = await this.staffBookService.getBooks({
      ...req.query,
      page,
      limit
    });

    return reply.status(200).send({
      message: 'Books retrieved successfully',
      meta: {
        total,
        totalOnPage: books.length,
        page,
        limit
      },
      data: books.map((book) => ({
        book_id: book.book_id,
        title: book.title,
        description: book.description,
        isbn: book.isbn,
        publisher_id: book.publisher_id,
        image_url: book.image_url,
        publisher_name: book.publisher?.name ?? null,
        authors: book.authors?.map((a) => ({ author_id: a.author.author_id, name: a.author.name })) ?? [],
        categories: book.categories?.map((c) => ({ category_id: c.category.category_id, name: c.category.name })) ?? [],
        published_at: book.published_at.toISOString(),
        created_at: book.created_at.toISOString(),
        updated_at: book.updated_at.toISOString()
      }))
    });
  }
}
