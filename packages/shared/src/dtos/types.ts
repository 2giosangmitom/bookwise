import z from "zod";

export const apiResponseSchema = z.object({
  message: z.string(),
  data: z.any(),
});
export type ApiResponse = z.infer<typeof apiResponseSchema>;
