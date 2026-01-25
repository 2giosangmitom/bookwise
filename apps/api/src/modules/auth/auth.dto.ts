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

// Sign in
export type SignInBody = {
  email: string & tags.Format<"email">;
  password: string & tags.Format<"password"> & tags.MinLength<typeof PASSWORD_MIN_LENGTH>;
};

export type SignInResponse = {
  message: string;
  data: {
    accessToken: string;
  };
};

// Change password body
export type ChangePasswordBody = {
  newPassword: string & tags.Format<"password"> & tags.MinLength<typeof PASSWORD_MIN_LENGTH>;
};
