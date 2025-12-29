import { Type } from 'typebox';
import { type FastifySchema } from 'fastify';

export const GetPublisherBySlugSchema = {
  summary: 'Get publisher details by slug',
  description: 'Endpoint to retrieve publisher information by their slug.',
  params: Type.Object({
    slug: Type.String()
  }),
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
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
