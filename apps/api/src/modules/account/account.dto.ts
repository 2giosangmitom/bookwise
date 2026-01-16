import { tags } from "typia";
import { PASSWORD_MIN_LENGTH } from "@bookwise/shared";

// Sign up
export type SignUpBody = {
  email: string & tags.Format<"email">;
  firstName: string;
  password: string & tags.Format<"password"> & tags.MinLength<typeof PASSWORD_MIN_LENGTH>;
  lastName?: string | null;
};

export type SignUpResponse = {
  message: string;
  data: {
    userId: string & tags.Format<"uuid">;
  };
};
