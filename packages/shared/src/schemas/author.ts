import { z } from "zod";

export const createAuthorSchema = z.object({
  name: z.string("Name is required").min(1),
  biography: z.string("Biography is required").min(1),
  dateOfBirth: z.iso.date(),
  dateOfDeath: z.iso.date().nullable().optional(),
  slug: z.string("Slug is required").min(1),
});
export type createAuthorDTO = z.infer<typeof createAuthorSchema>;
