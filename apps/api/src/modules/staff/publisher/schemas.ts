import { Type } from 'typebox';
import { type FastifySchema } from 'fastify';

export const CreatePublisherSchema = {
  summary: 'Create a new publisher',
  description: 'Endpoint to create a new publisher in the system.',
  body: Type.Object({
    name: Type.String(),
    website: Type.String(),
    slug: Type.String()
  }),
  security: [{ JWT: [] }],
  response: {
    201: Type.Object({
      message: Type.String(),
      data: Type.Object({
        publisher_id: Type.String({ format: 'uuid' }),
        name: Type.String(),
        website: Type.String(),
        slug: Type.String(),
        image_url: Type.Union([Type.String({ format: 'url' }), Type.Null()]),
        created_at: Type.String({ format: 'date-time' }),
        updated_at: Type.String({ format: 'date-time' })
      })
    }),
    403: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const DeletePublisherSchema = {
  summary: 'Delete a publisher',
  description: 'Endpoint to delete a publisher by their ID.',
  params: Type.Object({ publisher_id: Type.String({ format: 'uuid' }) }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({ publisher_id: Type.String({ format: 'uuid' }), name: Type.String() })
    }),
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const UpdatePublisherSchema = {
  summary: 'Update a publisher',
  description: 'Endpoint to update an existing publisher by their ID.',
  params: Type.Object({
    publisher_id: Type.String({ format: 'uuid' })
  }),
  body: Type.Object({
    name: Type.String(),
    website: Type.String(),
    slug: Type.String()
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        publisher_id: Type.String({ format: 'uuid' }),
        name: Type.String(),
        website: Type.String(),
        slug: Type.String(),
        image_url: Type.Union([Type.String({ format: 'url' }), Type.Null()]),
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

export const GetPublishersSchema = {
  summary: 'Get all publishers',
  description: 'Endpoint to retrieve all publishers in the system with pagination and filters.',
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
          publisher_id: Type.String({ format: 'uuid' }),
          name: Type.String(),
          website: Type.String(),
          slug: Type.String(),
          image_url: Type.Union([Type.String(), Type.Null()]),
          created_at: Type.String({ format: 'date-time' }),
          updated_at: Type.String({ format: 'date-time' })
        })
      )
    }),
    403: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
