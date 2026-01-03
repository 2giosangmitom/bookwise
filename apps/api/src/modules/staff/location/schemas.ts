import { type FastifySchema } from 'fastify';
import { Type } from 'typebox';

export const DeleteLocationSchema = {
  summary: 'Delete a location',
  description: 'Endpoint to delete a location by its ID',
  params: Type.Object({
    location_id: Type.String({ minLength: 1 })
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        location_id: Type.String(),
        room: Type.String(),
        floor: Type.Integer(),
        shelf: Type.Integer(),
        row: Type.Integer()
      })
    }),
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const AddLocationSchema = {
  summary: 'Add a new location',
  description: 'Endpoint to add a new location to the system',
  body: Type.Object({
    room: Type.String({ minLength: 1, maxLength: 50 }),
    floor: Type.Integer({ minimum: 1 }),
    shelf: Type.Integer({ minimum: 1 }),
    row: Type.Integer({ minimum: 1 })
  }),
  security: [{ JWT: [] }],
  response: {
    201: Type.Object({
      location_id: Type.String(),
      room: Type.String(),
      floor: Type.Integer(),
      shelf: Type.Integer(),
      row: Type.Integer(),
      created_at: Type.String({ format: 'date-time' }),
      updated_at: Type.String({ format: 'date-time' })
    }),
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const UpdateLocationSchema = {
  summary: 'Update a location',
  description: 'Endpoint to update an existing location by its ID',
  params: Type.Object({
    location_id: Type.String({ minLength: 1 })
  }),
  body: Type.Object({
    room: Type.String({ minLength: 1, maxLength: 50 }),
    floor: Type.Integer({ minimum: 1 }),
    shelf: Type.Integer({ minimum: 1 }),
    row: Type.Integer({ minimum: 1 })
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        location_id: Type.String(),
        room: Type.String(),
        floor: Type.Integer(),
        shelf: Type.Integer(),
        row: Type.Integer(),
        created_at: Type.String({ format: 'date-time' }),
        updated_at: Type.String({ format: 'date-time' })
      })
    }),
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const GetLocationsSchema = {
  summary: 'Get all locations',
  description: 'Endpoint to retrieve all locations in the system with pagination and filters.',
  security: [{ JWT: [] }],
  querystring: Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
    room: Type.Optional(Type.String()),
    floor: Type.Optional(Type.Integer({ minimum: 0 })),
    shelf: Type.Optional(Type.Integer({ minimum: 0 })),
    row: Type.Optional(Type.Integer({ minimum: 0 }))
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
          location_id: Type.String(),
          room: Type.String(),
          floor: Type.Integer(),
          shelf: Type.Integer(),
          row: Type.Integer(),
          created_at: Type.String({ format: 'date-time' }),
          updated_at: Type.String({ format: 'date-time' })
        })
      )
    }),
    403: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;
