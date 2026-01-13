import z from "zod";
import { apiResponseSchema } from "./types.js";

export const signUpResponseSchema = apiResponseSchema.extend({
  data: z.object({
    userId: z.string(),
  }),
});
export type SignUpResponse = z.infer<typeof signUpResponseSchema>;
