import { Type } from 'typebox';
import { type FastifySchema } from 'fastify';

const BookDataSchema = Type.Object({
  book_id: Type.String({ format: 'uuid' }),
  title: Type.String(),
  description: Type.String(),
  isbn: Type.String(),
  published_at: Type.String({ format: 'date-time' }),
  publisher_id: Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
  authors: Type.Array(Type.String({ format: 'uuid' })),
  categories: Type.Array(Type.String({ format: 'uuid' })),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' })
});

export const CreateBookSchema = {
  summary: 'Create a new book',
  description: 'Endpoint to create a new book in the system.',
  body: Type.Object({
    title: Type.String(),
    description: Type.String(),
    isbn: Type.String(),
    published_at: Type.String({ format: 'date-time' }),
    publisher_id: Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
    authors: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
    categories: Type.Optional(Type.Array(Type.String({ format: 'uuid' })))
  }),
  security: [{ JWT: [] }],
  response: {
    201: Type.Object({
      message: Type.String(),
      data: BookDataSchema
    }),
    403: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const DeleteBookSchema = {
  summary: 'Delete a book',
  description: 'Endpoint to delete a book by its ID.',
  params: Type.Object({
    book_id: Type.String({ format: 'uuid' })
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        book_id: Type.String({ format: 'uuid' }),
        title: Type.String()
      })
    }),
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const UpdateBookSchema = {
  summary: 'Update a book',
  description: 'Endpoint to update a book by its ID.',
  params: Type.Object({
    book_id: Type.String({ format: 'uuid' })
  }),
  body: Type.Object({
    title: Type.String(),
    description: Type.String(),
    isbn: Type.String(),
    published_at: Type.String({ format: 'date-time' }),
    publisher_id: Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
    authors: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
    categories: Type.Optional(Type.Array(Type.String({ format: 'uuid' })))
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: BookDataSchema
    }),
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const GetBooksSchema = {
  summary: 'Get all books',
  description: 'Endpoint to retrieve all books in the system with pagination and filters.',
  security: [{ JWT: [] }],
  querystring: Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
    searchTerm: Type.Optional(Type.String())
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
          created_at: Type.String({ format: 'date-time' }),
          updated_at: Type.String({ format: 'date-time' })
        })
      )
    }),
    403: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
