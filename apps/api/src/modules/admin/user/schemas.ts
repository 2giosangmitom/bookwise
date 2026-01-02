import { Type } from 'typebox';
import { type FastifySchema } from 'fastify';
import { Role } from '@/generated/prisma/enums';
import { passwordMinLength, passwordMaxLength, nameMinLength, nameMaxLength } from '@/constants';

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
    searchTerm: Type.Optional(Type.String()),
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

export const UpdateUserSchema = {
  summary: 'Update user',
  description: 'Update user information including name, email, role, and optionally password.',
  security: [{ JWT: [] }],
  params: Type.Object({
    userId: Type.String({ format: 'uuid' })
  }),
  body: Type.Object({
    name: Type.Optional(Type.String({ minLength: nameMinLength, maxLength: nameMaxLength })),
    email: Type.Optional(Type.String({ format: 'email' })),
    role: Type.Optional(Type.Enum(Role)),
    password: Type.Optional(Type.String({ minLength: passwordMinLength, maxLength: passwordMaxLength }))
  }),
  response: {
    200: Type.Object({
      message: Type.String(),
      data: UserDataSchema
    }),
    400: { $ref: 'HttpError' },
    401: { $ref: 'HttpError' },
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
