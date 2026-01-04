import { type FastifySchema } from 'fastify';
import { Type } from 'typebox';

export const CreateCategorySchema = {
  summary: 'Create a new category (staff)',
  description: 'Staff endpoint to create a new category in the system.',
  body: Type.Object({
    name: Type.String(),
    slug: Type.String()
  }),
  security: [{ JWT: [] }],
  response: {
    201: Type.Object({
      message: Type.String(),
      data: Type.Object({
        category_id: Type.String({ format: 'uuid' }),
        name: Type.String(),
        slug: Type.String(),
        created_at: Type.String({ format: 'date-time' }),
        updated_at: Type.String({ format: 'date-time' })
      })
    }),
    403: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const DeleteCategorySchema = {
  summary: 'Delete a category (staff)',
  params: Type.Object({
    category_id: Type.String({ format: 'uuid' })
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        category_id: Type.String({ format: 'uuid' }),
        name: Type.String()
      })
    }),
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const UpdateCategorySchema = {
  summary: 'Update a category (staff)',
  description: 'Staff endpoint to update an existing category in the system.',
  params: Type.Object({
    category_id: Type.String({ format: 'uuid' })
  }),
  body: Type.Object({
    name: Type.Optional(Type.String()),
    slug: Type.Optional(Type.String())
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        category_id: Type.String({ format: 'uuid' }),
        name: Type.String(),
        slug: Type.String(),
        created_at: Type.String({ format: 'date-time' }),
        updated_at: Type.String({ format: 'date-time' })
      })
    }),
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const GetCategoriesSchema = {
  summary: 'Get categories (staff)',
  description: 'Staff endpoint to retrieve categories with optional pagination and filters.',
  querystring: Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
    searchTerm: Type.Optional(Type.String())
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
          category_id: Type.String({ format: 'uuid' }),
          name: Type.String(),
          slug: Type.String(),
          created_at: Type.String({ format: 'date-time' }),
          updated_at: Type.String({ format: 'date-time' })
        })
      )
    }),
    403: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const GetKPopularCategoriesSchema = {
  summary: 'Get K popular categories',
  description: 'Retrieve the top K categories based on the number of books associated with each category.',
  querystring: Type.Object({
    k: Type.Number({ minimum: 1, maximum: 100 })
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      meta: Type.Object({
        total_loans: Type.Number() // Total number of loans for calculate percentage
      }),
      data: Type.Array(
        Type.Object({
          category_id: Type.String({ format: 'uuid' }),
          name: Type.String(),
          slug: Type.String(),
          loan_count: Type.Number()
        })
      )
    }),
    403: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const GetCategoryDistributionSchema = {
  summary: 'Get category distribution',
  description: 'Retrieve the distribution of books across all categories.',
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Array(
        Type.Object({
          category_id: Type.String({ format: 'uuid' }),
          name: Type.String(),
          book_count: Type.Number()
        })
      )
    }),
    403: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
