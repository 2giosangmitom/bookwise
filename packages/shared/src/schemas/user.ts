import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email("Invalid email format"),
  firstName: z.string("First name is required").min(1),
  lastName: z.nullable(z.string()).optional(),
});
export type createUserDTO = z.infer<typeof createUserSchema>;
