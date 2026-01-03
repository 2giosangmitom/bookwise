import { Type } from 'typebox';
import { type FastifySchema } from 'fastify';
import { BookCondition } from '@/generated/prisma/enums';

export const CreateBookCloneSchema = {
  summary: 'Create a new book clone',
  description: 'Endpoint to create a new book clone (physical copy) in the system.',
  body: Type.Object({
    book_id: Type.String({ format: 'uuid' }),
    location_id: Type.String(),
    barcode: Type.String(),
    condition: Type.Enum(BookCondition)
  }),
  security: [{ JWT: [] }],
  response: {
    201: Type.Object({
      message: Type.String(),
      data: Type.Object({
        book_clone_id: Type.String({ format: 'uuid' }),
        book_id: Type.String({ format: 'uuid' }),
        location_id: Type.String(),
        barcode: Type.String(),
        condition: Type.String(),
        created_at: Type.String({ format: 'date-time' }),
        updated_at: Type.String({ format: 'date-time' })
      })
    }),
    403: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const DeleteBookCloneSchema = {
  summary: 'Delete a book clone',
  description: 'Endpoint to delete a book clone by its ID.',
  params: Type.Object({
    book_clone_id: Type.String({ format: 'uuid' })
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        book_clone_id: Type.String({ format: 'uuid' }),
        barcode: Type.String()
      })
    }),
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const UpdateBookCloneSchema = {
  summary: 'Update a book clone',
  description: 'Endpoint to update an existing book clone by its ID.',
  params: Type.Object({
    book_clone_id: Type.String({ format: 'uuid' })
  }),
  body: Type.Object({
    book_id: Type.String({ format: 'uuid' }),
    location_id: Type.String(),
    barcode: Type.String(),
    condition: Type.Enum(BookCondition)
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        book_clone_id: Type.String({ format: 'uuid' }),
        book_id: Type.String({ format: 'uuid' }),
        location_id: Type.String(),
        barcode: Type.String(),
        condition: Type.String(),
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

export const GetBookClonesSchema = {
  summary: 'Get all book clones',
  description: 'Endpoint to retrieve all book clones in the system.',
  security: [{ JWT: [] }],
  querystring: Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
    searchTerm: Type.Optional(Type.String()),
    condition: Type.Optional(Type.Enum(BookCondition)),
    is_available: Type.Optional(Type.Boolean())
  }),
  response: {
    200: Type.Object({
      message: Type.String(),
      meta: Type.Object({
        totalPages: Type.Number()
      }),
      data: Type.Array(
        Type.Object({
          book_clone_id: Type.String({ format: 'uuid' }),
          book_id: Type.String({ format: 'uuid' }),
          book_title: Type.String(),
          location_id: Type.String(),
          barcode: Type.String(),
          condition: Type.String(),
          is_available: Type.Boolean(),
          created_at: Type.String({ format: 'date-time' }),
          updated_at: Type.String({ format: 'date-time' })
        })
      )
    }),
    403: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
