import { Type } from 'typebox';
import { type FastifySchema } from 'fastify';
import { Role } from '@/generated/prisma/enums';

const UserDataSchema = Type.Object({
  user_id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  email: Type.String({ format: 'email' }),
  role: Type.Enum(Role),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' })
});

export const GetUsersSchema = {
  summary: 'Get users',
  description: 'List users with pagination and optional filters.',
  security: [{ JWT: [] }],
  querystring: Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
    email: Type.Optional(Type.String()),
    name: Type.Optional(Type.String()),
    role: Type.Optional(Type.Enum(Role))
  }),
  response: {
    200: Type.Object({
      message: Type.String(),
      meta: Type.Object({
        totalPages: Type.Number()
      }),
      data: Type.Array(UserDataSchema)
    }),
    401: { $ref: 'HttpError' },
    403: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
