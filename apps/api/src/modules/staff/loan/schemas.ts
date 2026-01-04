import { Type } from 'typebox';
import { type FastifySchema } from 'fastify';
import { LoanStatus } from '@/generated/prisma/enums';

const LoanDataSchema = Type.Object({
  loan_id: Type.String({ format: 'uuid' }),
  user_id: Type.String({ format: 'uuid' }),
  user_name: Type.String(),
  book_clone_id: Type.String({ format: 'uuid' }),
  book_title: Type.String(),
  barcode: Type.String(),
  loan_date: Type.String({ format: 'date-time' }),
  due_date: Type.String({ format: 'date-time' }),
  return_date: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
  status: Type.Enum(LoanStatus),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' })
});

export const CreateLoanSchema = {
  summary: 'Create a loan',
  description: 'Create a new loan for a book clone and user.',
  body: Type.Object({
    user_id: Type.String({ format: 'uuid' }),
    book_clone_id: Type.String({ format: 'uuid' }),
    loan_date: Type.String({ format: 'date-time' }),
    due_date: Type.String({ format: 'date-time' })
  }),
  security: [{ JWT: [] }],
  response: {
    201: Type.Object({
      message: Type.String(),
      data: LoanDataSchema
    }),
    400: { $ref: 'HttpError' },
    403: { $ref: 'HttpError' },
    409: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const UpdateLoanSchema = {
  summary: 'Update a loan',
  description: 'Update loan status, due date, or return date.',
  params: Type.Object({
    loan_id: Type.String({ format: 'uuid' })
  }),
  body: Type.Object(
    {
      loan_date: Type.Optional(Type.String({ format: 'date-time' })),
      due_date: Type.Optional(Type.String({ format: 'date-time' })),
      return_date: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()])),
      status: Type.Optional(Type.Enum(LoanStatus))
    },
    { additionalProperties: false, minProperties: 1 }
  ),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: LoanDataSchema
    }),
    400: { $ref: 'HttpError' },
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const DeleteLoanSchema = {
  summary: 'Delete a loan',
  description: 'Remove a loan record for a book clone.',
  params: Type.Object({
    loan_id: Type.String({ format: 'uuid' })
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: LoanDataSchema
    }),
    400: { $ref: 'HttpError' },
    403: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const GetLoansSchema = {
  summary: 'Get all loans',
  description: 'Retrieve loans with pagination, optional search and status filter.',
  security: [{ JWT: [] }],
  querystring: Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
    search: Type.Optional(Type.String()),
    status: Type.Optional(Type.Enum(LoanStatus)),
    user_id: Type.Optional(Type.String({ format: 'uuid' }))
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
      data: Type.Array(LoanDataSchema)
    }),
    403: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;

export const GetTotalLoansSchema = {
  summary: 'Get total loans',
  description: 'Retrieve the total number of loans.',
  querystring: Type.Object({
    status: Type.Optional(Type.Enum(LoanStatus))
  }),
  security: [{ JWT: [] }],
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        total_loans: Type.Number()
      })
    }),
    403: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
