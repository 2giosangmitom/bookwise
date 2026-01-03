import { CreateBookCloneSchema, DeleteBookCloneSchema, GetBookClonesSchema, UpdateBookCloneSchema } from './schemas';
import type StaffBookCloneService from './services';

export default class StaffBookCloneController {
  private staffBookCloneService: StaffBookCloneService;

  public constructor({ staffBookCloneService }: { staffBookCloneService: StaffBookCloneService }) {
    this.staffBookCloneService = staffBookCloneService;
  }

  public async createBookClone(
    req: FastifyRequestTypeBox<typeof CreateBookCloneSchema>,
    reply: FastifyReplyTypeBox<typeof CreateBookCloneSchema>
  ) {
    const { book_id, location_id, barcode, condition } = req.body;

    const createdBookClone = await this.staffBookCloneService.createBookClone({
      book_id,
      location_id,
      barcode,
      condition
    });

    return reply.code(201).send({
      message: 'Book clone created successfully',
      data: {
        book_clone_id: createdBookClone.book_clone_id,
        book_id: createdBookClone.book_id,
        location_id: createdBookClone.location_id,
        barcode: createdBookClone.barcode,
        condition: createdBookClone.condition,
        created_at: createdBookClone.created_at.toISOString(),
        updated_at: createdBookClone.updated_at.toISOString()
      }
    });
  }

  public async deleteBookClone(
    req: FastifyRequestTypeBox<typeof DeleteBookCloneSchema>,
    reply: FastifyReplyTypeBox<typeof DeleteBookCloneSchema>
  ) {
    const { book_clone_id } = req.params;

    const deleted = await this.staffBookCloneService.deleteBookClone(book_clone_id);

    return reply.status(200).send({
      message: 'Book clone deleted successfully',
      data: deleted
    });
  }

  public async updateBookClone(
    req: FastifyRequestTypeBox<typeof UpdateBookCloneSchema>,
    reply: FastifyReplyTypeBox<typeof UpdateBookCloneSchema>
  ) {
    const { book_clone_id } = req.params;
    const { book_id, location_id, barcode, condition } = req.body;

    const updated = await this.staffBookCloneService.updateBookClone(book_clone_id, {
      book_id,
      location_id,
      barcode,
      condition
    });

    return reply.status(200).send({
      message: 'Book clone updated successfully',
      data: {
        ...updated,
        created_at: updated.created_at.toISOString(),
        updated_at: updated.updated_at.toISOString()
      }
    });
  }

  public async getBookClones(
    req: FastifyRequestTypeBox<typeof GetBookClonesSchema>,
    reply: FastifyReplyTypeBox<typeof GetBookClonesSchema>
  ) {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 10;
    const { bookClones, total } = await this.staffBookCloneService.getBookClones({
      ...req.query,
      page,
      limit
    });

    return reply.status(200).send({
      message: 'Book clones retrieved successfully',
      meta: {
        total,
        totalOnPage: bookClones.length,
        page,
        limit
      },
      data: bookClones.map((clone) => ({
        book_clone_id: clone.book_clone_id,
        book_id: clone.book_id,
        book_title: clone.book.title,
        location_id: clone.location_id,
        barcode: clone.barcode,
        condition: clone.condition,
        is_available: !clone.loan || clone.loan.status === 'RETURNED',
        created_at: clone.created_at.toISOString(),
        updated_at: clone.updated_at.toISOString()
      }))
    });
  }
}
