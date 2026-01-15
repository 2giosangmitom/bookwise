import { z } from "zod";

export const createPublisherSchema = z.object({
  name: z.string("Name is required").min(1),
  description: z.string("Description is required").min(1),
  website: z.string("Website is required").min(1),
  slug: z.string("Slug is required").min(1),
});
export type createPublisherDTO = z.infer<typeof createPublisherSchema>;
