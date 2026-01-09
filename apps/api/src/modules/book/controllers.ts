import type BookService from './services';
import { GetNewBooksSchema, SearchBooksSchema, GetBookByIdSchema } from './schemas';

const rustfsPublicEndpoint = process.env.RUSTFS_PUBLIC_ENDPOINT ?? process.env.RUSTFS_ENDPOINT;

export default class BookController {
  private bookService: BookService;

  public constructor({ bookService }: { bookService: BookService }) {
    this.bookService = bookService;
  }

  private formatImageUrl(image_url: string | null): string | null {
    return image_url ? `${rustfsPublicEndpoint}/${image_url}` : null;
  }

  public async searchBooks(
    req: FastifyRequestTypeBox<typeof SearchBooksSchema>,
    reply: FastifyReplyTypeBox<typeof SearchBooksSchema>
  ) {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 12;
    const result = await this.bookService.searchBooks({
      page,
      limit,
      searchTerm: req.query.searchTerm,
      category_id: req.query.category_id,
      author_id: req.query.author_id,
      available_only: req.query.available_only,
      sort_by: req.query.sort_by
    });

    return reply.status(200).send({
      message: 'Books retrieved successfully',
      meta: {
        total: result.total,
        totalOnPage: result.books.length,
        page,
        limit
      },
      data: result.books.map((book) => ({
        ...book,
        image_url: this.formatImageUrl(book.image_url)
      }))
    });
  }

  public async getBookById(
    req: FastifyRequestTypeBox<typeof GetBookByIdSchema>,
    reply: FastifyReplyTypeBox<typeof GetBookByIdSchema>
  ) {
    const book = await this.bookService.getBookById(req.params.book_id);

    return reply.status(200).send({
      message: 'Book retrieved successfully',
      data: {
        ...book,
        image_url: this.formatImageUrl(book.image_url)
      }
    });
  }

  public async getNewBooks(
    req: FastifyRequestTypeBox<typeof GetNewBooksSchema>,
    reply: FastifyReplyTypeBox<typeof GetNewBooksSchema>
  ) {
    const limit = (req.query as { limit?: number }).limit ?? 8;
    const books = await this.bookService.getNewBooks(limit);

    return reply.status(200).send({
      message: 'New books retrieved successfully',
      data: books.map((book) => ({
        ...book,
        image_url: this.formatImageUrl(book.image_url)
      }))
    });
  }
}
