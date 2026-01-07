import type BookService from './services';
import { GetNewBooksSchema } from './schemas';

const rustfsPublicEndpoint = process.env.RUSTFS_PUBLIC_ENDPOINT ?? process.env.RUSTFS_ENDPOINT;

export default class BookController {
  private bookService: BookService;

  public constructor({ bookService }: { bookService: BookService }) {
    this.bookService = bookService;
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
        image_url: book.image_url ? `${rustfsPublicEndpoint}/${book.image_url}` : null
      }))
    });
  }
}
