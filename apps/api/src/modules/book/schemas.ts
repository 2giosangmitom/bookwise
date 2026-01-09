import { Type } from 'typebox';
import { type FastifySchema } from 'fastify';

const BookWithAvailabilitySchema = Type.Object({
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
  average_rating: Type.Union([Type.Number(), Type.Null()]),
  rating_count: Type.Number({ minimum: 0 }),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' })
});

export const SearchBooksSchema = {
  summary: 'Search and browse book catalog',
  description: 'Public endpoint to search books by title, author, ISBN, or description with filtering and pagination.',
  querystring: Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 50, default: 12 })),
    searchTerm: Type.Optional(Type.String()),
    category_id: Type.Optional(Type.String({ format: 'uuid' })),
    author_id: Type.Optional(Type.String({ format: 'uuid' })),
    available_only: Type.Optional(Type.Boolean({ default: false })),
    sort_by: Type.Optional(Type.Union([Type.Literal('newest'), Type.Literal('oldest'), Type.Literal('title'), Type.Literal('rating')]))
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
      data: Type.Array(BookWithAvailabilitySchema)
    }),
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const GetBookByIdSchema = {
  summary: 'Get book details by ID',
  description: 'Public endpoint to retrieve detailed information about a specific book.',
  params: Type.Object({
    book_id: Type.String({ format: 'uuid' })
  }),
  response: {
    200: Type.Object({
      message: Type.String(),
      data: BookWithAvailabilitySchema
    }),
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

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
