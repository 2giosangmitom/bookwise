import { Type } from 'typebox';
import { type FastifySchema } from 'fastify';

const AuthorEntitySchema = Type.Object({
  author_id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  short_biography: Type.String(),
  biography: Type.String(),
  date_of_birth: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
  date_of_death: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
  nationality: Type.Union([Type.String(), Type.Null()]),
  image_url: Type.Union([Type.String({ format: 'url' }), Type.Null()]),
  slug: Type.String(),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' })
});

export const CreateAuthorSchema = {
  summary: 'Create a new author',
  description: 'Endpoint to create a new author in the system.',
  body: Type.Object({
    name: Type.String(),
    short_biography: Type.String(),
    biography: Type.String(),
    date_of_birth: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
    date_of_death: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
    nationality: Type.Union([Type.String(), Type.Null()]),
    slug: Type.String()
  }),
  security: [{ JWT: [] }],
  response: {
    201: Type.Object({
      message: Type.String(),
      data: AuthorEntitySchema
    }),
    403: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const DeleteAuthorSchema = {
  summary: 'Delete an author',
  description: 'Endpoint to delete an author by their ID.',
  params: Type.Object({
    author_id: Type.String({ format: 'uuid' })
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        author_id: Type.String({ format: 'uuid' }),
        name: Type.String()
      })
    }),
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const UpdateAuthorSchema = {
  summary: 'Update an author',
  description: 'Endpoint to update an existing author by their ID.',
  params: Type.Object({
    author_id: Type.String({ format: 'uuid' })
  }),
  body: Type.Object({
    name: Type.String(),
    short_biography: Type.String(),
    biography: Type.String(),
    date_of_birth: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
    date_of_death: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
    nationality: Type.Union([Type.String(), Type.Null()]),
    slug: Type.String()
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: AuthorEntitySchema
    }),
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const GetAuthorsSchema = {
  summary: 'Get authors',
  description: 'Retrieve authors with pagination, filtering and sorting.',
  querystring: Type.Object({
    page: Type.Optional(Type.Integer({ minimum: 1 })),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 50 })),
    search: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
    nationality: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
    sort_by: Type.Optional(Type.Enum(['name', 'created_at', 'updated_at'])),
    order: Type.Optional(Type.Enum(['asc', 'desc'])),
    is_alive: Type.Optional(Type.Boolean())
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        meta: Type.Object({
          total: Type.Integer({ minimum: 0 }),
          page: Type.Integer({ minimum: 1 }),
          limit: Type.Integer({ minimum: 1 }),
          totalPages: Type.Integer({ minimum: 0 })
        }),
        items: Type.Array(AuthorEntitySchema)
      })
    }),
    400: { $ref: 'HttpError' },
    403: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export { AuthorEntitySchema };
