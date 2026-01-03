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
  description: 'Retrieve authors with pagination and filtering.',
  querystring: Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
    searchTerm: Type.Optional(Type.String()),
    is_alive: Type.Optional(Type.Boolean())
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
      data: Type.Array(AuthorEntitySchema)
    }),
    400: { $ref: 'HttpError' },
    403: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export { AuthorEntitySchema };
