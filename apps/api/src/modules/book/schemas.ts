import { Type } from 'typebox';
import { type FastifySchema } from 'fastify';

export const GetNewBooksSchema = {
  summary: 'Get newly added books',
  description: 'Retrieve recently added books with availability information for public display.',
  querystring: Type.Object({
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 50, default: 8 }))
  }),
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Array(
        Type.Object({
          book_id: Type.String({ format: 'uuid' }),
          title: Type.String(),
          description: Type.String(),
          isbn: Type.String(),
          published_at: Type.String({ format: 'date-time' }),
          publisher_id: Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
          publisher_name: Type.Union([Type.String(), Type.Null()]),
          image_url: Type.Union([Type.String(), Type.Null()]),
          authors: Type.Array(
            Type.Object({
              author_id: Type.String({ format: 'uuid' }),
              name: Type.String()
            })
          ),
          categories: Type.Array(
            Type.Object({
              category_id: Type.String({ format: 'uuid' }),
              name: Type.String()
            })
          ),
          available_copies: Type.Number({ minimum: 0 }),
          total_copies: Type.Number({ minimum: 0 }),
          created_at: Type.String({ format: 'date-time' }),
          updated_at: Type.String({ format: 'date-time' })
        })
      )
    }),
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
