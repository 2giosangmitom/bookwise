import { z } from "zod";
import { createUserSchema } from "./user.js";

export const signUpSchema = createUserSchema.extend({
  password: z.string("Password is required").min(6, "Password must at least 6 characters"),
});
export type signUpDTO = z.infer<typeof signUpSchema>;
