import { Type } from 'typebox';
import { type FastifySchema } from 'fastify';

const RatingDataSchema = Type.Object({
  rating_id: Type.String({ format: 'uuid' }),
  book_id: Type.String({ format: 'uuid' }),
  user_id: Type.String({ format: 'uuid' }),
  user_name: Type.String(),
  rate: Type.Number({ minimum: 1, maximum: 5 }),
  comment: Type.String(),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' })
});

export const CreateRatingSchema = {
  summary: 'Create a rating for a book',
  description: 'Endpoint for authenticated users to rate and review a book. Users can only rate a book once.',
  body: Type.Object({
    book_id: Type.String({ format: 'uuid' }),
    rate: Type.Number({ minimum: 1, maximum: 5 }),
    comment: Type.String({ minLength: 1, maxLength: 1000 })
  }),
  security: [{ JWT: [] }],
  response: {
    201: Type.Object({
      message: Type.String(),
      data: RatingDataSchema
    }),
    400: { $ref: 'HttpError' },
    401: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const UpdateRatingSchema = {
  summary: 'Update a rating',
  description: 'Endpoint for users to update their own rating on a book.',
  params: Type.Object({
    rating_id: Type.String({ format: 'uuid' })
  }),
  body: Type.Object({
    rate: Type.Number({ minimum: 1, maximum: 5 }),
    comment: Type.String({ minLength: 1, maxLength: 1000 })
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: RatingDataSchema
    }),
    401: { $ref: 'HttpError' },
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const DeleteRatingSchema = {
  summary: 'Delete a rating',
  description: 'Endpoint for users to delete their own rating.',
  params: Type.Object({
    rating_id: Type.String({ format: 'uuid' })
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        rating_id: Type.String({ format: 'uuid' })
      })
    }),
    401: { $ref: 'HttpError' },
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const GetBookRatingsSchema = {
  summary: 'Get ratings for a book',
  description: 'Retrieve all ratings and reviews for a specific book with pagination.',
  params: Type.Object({
    book_id: Type.String({ format: 'uuid' })
  }),
  querystring: Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 50, default: 10 }))
  }),
  response: {
    200: Type.Object({
      message: Type.String(),
      meta: Type.Object({
        total: Type.Number(),
        totalOnPage: Type.Number(),
        page: Type.Number(),
        limit: Type.Number(),
        averageRating: Type.Union([Type.Number(), Type.Null()])
      }),
      data: Type.Array(RatingDataSchema)
    }),
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const GetUserRatingsSchema = {
  summary: 'Get current user ratings',
  description: 'Retrieve all ratings made by the authenticated user.',
  querystring: Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 50, default: 10 }))
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      meta: Type.Object({
        total: Type.Number(),
        totalOnPage: Type.Number(),
        page: Type.Number(),
        limit: Type.Number()
      }),
      data: Type.Array(
        Type.Object({
          rating_id: Type.String({ format: 'uuid' }),
          book_id: Type.String({ format: 'uuid' }),
          book_title: Type.String(),
          rate: Type.Number({ minimum: 1, maximum: 5 }),
          comment: Type.String(),
          created_at: Type.String({ format: 'date-time' }),
          updated_at: Type.String({ format: 'date-time' })
        })
      )
    }),
    401: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
