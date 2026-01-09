import { Type } from 'typebox';
import { type FastifySchema } from 'fastify';

export const GetCategoriesSchema = {
  summary: 'Get all categories',
  description: 'Public endpoint to retrieve all book categories for catalog filtering.',
  querystring: Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 50 }))
  }),
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
          category_id: Type.String({ format: 'uuid' }),
          name: Type.String(),
          slug: Type.String(),
          book_count: Type.Number({ minimum: 0 })
        })
      )
    }),
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const GetCategoryBySlugSchema = {
  summary: 'Get category by slug',
  description: 'Public endpoint to retrieve a specific category by its slug.',
  params: Type.Object({
    slug: Type.String()
  }),
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        category_id: Type.String({ format: 'uuid' }),
        name: Type.String(),
        slug: Type.String(),
        book_count: Type.Number({ minimum: 0 })
      })
    }),
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
