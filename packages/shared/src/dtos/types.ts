import z from "zod";

export const apiResponseSchema = z.object({
  message: z.string(),
});
export type ApiResponse = z.infer<typeof apiResponseSchema>;

export const apiErrorResponseSchema = apiResponseSchema.extend({
  error: z.string(),
  statusCode: z.number(),
});
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
