import z from "zod";
import { apiResponseSchema } from "./types.js";

export const createPublisherResponseSchema = apiResponseSchema.extend({
  data: z.object({
    publisherId: z.string(),
  }),
});
export type CreatePublisherResponse = z.infer<typeof createPublisherResponseSchema>;

export const deletePublisherResponseSchema = apiResponseSchema.extend({
  data: z.object({
    name: z.string(),
    description: z.string(),
    website: z.string(),
    slug: z.string(),
    photoFileName: z.string().nullable(),
  }),
});
export type DeletePublisherResponse = z.infer<typeof deletePublisherResponseSchema>;
