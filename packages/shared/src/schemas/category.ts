import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string("Name is required").min(1),
  slug: z.string("Slug is required").min(1),
});
export type createCategoryDTO = z.infer<typeof createCategorySchema>;
