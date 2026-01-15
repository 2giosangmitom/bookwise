import z from "zod";
import { apiResponseSchema } from "./types.js";

export const createAuthorResponseSchema = apiResponseSchema.extend({
  data: z.object({
    authorId: z.string(),
  }),
});
export type CreateAuthorResponse = z.infer<typeof createAuthorResponseSchema>;
