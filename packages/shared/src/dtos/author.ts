import z from "zod";
import { apiResponseSchema } from "./types.js";

export const createAuthorResponseSchema = apiResponseSchema.extend({
  data: z.object({
    authorId: z.string(),
  }),
});
export type CreateAuthorResponse = z.infer<typeof createAuthorResponseSchema>;

export const deleteAuthorResponseSchema = apiResponseSchema.extend({
  data: z.object({
    name: z.string(),
    biography: z.string(),
    dateOfBirth: z.string(),
    dateOfDeath: z.string().nullable(),
    slug: z.string(),
    photoFileName: z.string().nullable(),
  }),
});
export type DeleteAuthorResponse = z.infer<typeof deleteAuthorResponseSchema>;
