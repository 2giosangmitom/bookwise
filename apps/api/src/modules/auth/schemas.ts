import { Type } from 'typebox';
import { type FastifySchema } from 'fastify';
import { nameMinLength, nameMaxLength, passwordMaxLength, passwordMinLength } from '@/constants';
import { Role } from '@/generated/prisma/enums';

export const SignUpSchema = {
  summary: 'Create a new user account',
  description: 'Creates a new user account with the provided email, password, and full name.',
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: passwordMinLength, maxLength: passwordMaxLength }),
    fullName: Type.String({ minLength: nameMinLength, maxLength: nameMaxLength })
  }),
  response: {
    201: Type.Object({
      message: Type.String(),
      data: Type.Object({
        user_id: Type.String({ format: 'uuid' }),
        email: Type.String({ format: 'email' }),
        name: Type.String({ minLength: nameMinLength, maxLength: nameMaxLength }),
        role: Type.Enum(Role),
        created_at: Type.String({ format: 'date-time' }),
        updated_at: Type.String({ format: 'date-time' })
      })
    }),
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const SignInSchema = {
  summary: 'Authenticate a user',
  description: 'Authenticates a user with the provided email and password.',
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: passwordMinLength, maxLength: passwordMaxLength })
  }),
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        access_token: Type.String()
      })
    }),
    401: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const RefreshTokenSchema = {
  summary: 'Refresh access token',
  description: 'Generates a new access token using a valid refresh token.',
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        access_token: Type.String()
      })
    }),
    401: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const SignOutSchema = {
  summary: 'Sign out a user',
  description: 'Signs out a user by revoking their tokens.',
  response: {
    200: Type.Object({
      message: Type.String()
    }),
    401: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
