import z from "zod";
import { apiResponseSchema } from "./types.js";

export const createPublisherResponseSchema = apiResponseSchema.extend({
  data: z.object({
    publisherId: z.string(),
  }),
});
export type CreatePublisherResponse = z.infer<typeof createPublisherResponseSchema>;
