import { type FastifySchema } from 'fastify';
import { Type } from 'typebox';
import { passwordMinLength, passwordMaxLength } from '@/constants';

export const GetMeSchema = {
  summary: 'Get current user profile',
  description: 'Retrieve the profile information of the currently authenticated user.',
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        user_id: Type.String({ format: 'uuid' }),
        name: Type.String(),
        email: Type.String({ format: 'email' }),
        role: Type.Union([Type.Literal('ADMIN'), Type.Literal('LIBRARIAN'), Type.Literal('MEMBER')]),
        created_at: Type.String({ format: 'date-time' }),
        updated_at: Type.String({ format: 'date-time' })
      })
    }),
    401: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const ChangePasswordSchema = {
  summary: 'Change user password',
  description: 'Change the password for the currently authenticated user.',
  body: Type.Object({
    current_password: Type.String({ minLength: passwordMinLength, maxLength: passwordMaxLength }),
    new_password: Type.String({ minLength: passwordMinLength, maxLength: passwordMaxLength })
  }),
  response: {
    200: Type.Object({
      message: Type.String()
    }),
    400: { $ref: 'HttpError' },
    401: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
