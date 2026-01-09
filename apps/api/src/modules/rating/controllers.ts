import type RatingService from './services';
import {
  CreateRatingSchema,
  UpdateRatingSchema,
  DeleteRatingSchema,
  GetBookRatingsSchema,
  GetUserRatingsSchema
} from './schemas';

export default class RatingController {
  private ratingService: RatingService;

  public constructor({ ratingService }: { ratingService: RatingService }) {
    this.ratingService = ratingService;
  }

  public async createRating(
    req: FastifyRequestTypeBox<typeof CreateRatingSchema>,
    reply: FastifyReplyTypeBox<typeof CreateRatingSchema>
  ) {
    const user = req.user as AccessToken;
    const rating = await this.ratingService.createRating({
      book_id: req.body.book_id,
      user_id: user.sub,
      rate: req.body.rate,
      comment: req.body.comment
    });

    return reply.status(201).send({
      message: 'Rating created successfully',
      data: rating
    });
  }

  public async updateRating(
    req: FastifyRequestTypeBox<typeof UpdateRatingSchema>,
    reply: FastifyReplyTypeBox<typeof UpdateRatingSchema>
  ) {
    const user = req.user as AccessToken;
    const rating = await this.ratingService.updateRating(req.params.rating_id, user.sub, {
      rate: req.body.rate,
      comment: req.body.comment
    });

    return reply.status(200).send({
      message: 'Rating updated successfully',
      data: rating
    });
  }

  public async deleteRating(
    req: FastifyRequestTypeBox<typeof DeleteRatingSchema>,
    reply: FastifyReplyTypeBox<typeof DeleteRatingSchema>
  ) {
    const user = req.user as AccessToken;
    const result = await this.ratingService.deleteRating(req.params.rating_id, user.sub);

    return reply.status(200).send({
      message: 'Rating deleted successfully',
      data: result
    });
  }

  public async getBookRatings(
    req: FastifyRequestTypeBox<typeof GetBookRatingsSchema>,
    reply: FastifyReplyTypeBox<typeof GetBookRatingsSchema>
  ) {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 10;
    const result = await this.ratingService.getBookRatings(req.params.book_id, page, limit);

    return reply.status(200).send({
      message: 'Ratings retrieved successfully',
      meta: {
        total: result.total,
        totalOnPage: result.ratings.length,
        page,
        limit,
        averageRating: result.averageRating
      },
      data: result.ratings
    });
  }

  public async getUserRatings(
    req: FastifyRequestTypeBox<typeof GetUserRatingsSchema>,
    reply: FastifyReplyTypeBox<typeof GetUserRatingsSchema>
  ) {
    const user = req.user as AccessToken;
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 10;
    const result = await this.ratingService.getUserRatings(user.sub, page, limit);

    return reply.status(200).send({
      message: 'User ratings retrieved successfully',
      meta: {
        total: result.total,
        totalOnPage: result.ratings.length,
        page,
        limit
      },
      data: result.ratings
    });
  }
}
