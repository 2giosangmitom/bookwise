import { type FastifySchema } from 'fastify';
import { Type } from 'typebox';

export const GetAuthorBySlugSchema = {
  summary: 'Get author by slug',
  description: 'Endpoint to retrieve an author by their slug.',
  params: Type.Object({
    slug: Type.String()
  }),
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
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
      })
    }),
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
