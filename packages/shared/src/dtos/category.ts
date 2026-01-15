import z from "zod";
import { apiResponseSchema } from "./types.js";

export const createCategoryResponseSchema = apiResponseSchema.extend({
  data: z.object({
    categoryId: z.string(),
  }),
});
export type CreateCategoryResponse = z.infer<typeof createCategoryResponseSchema>;
