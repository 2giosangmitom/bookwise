import { tags } from "typia";
import { Role } from "@bookwise/shared";

export type CreateUserBody = {
  email: string & tags.Format<"email">;
  firstName: string;
  lastName?: string | null;
};

export type CreateUserResponse = {
  message: string;
  data: {
    userId: string & tags.Format<"uuid">;
  };
};

export type UpdateUserBody = Partial<CreateUserBody>;

export type GetMeResponse = {
  message: string;
  data: Required<CreateUserBody> & {
    id: string & tags.Format<"uuid">;
    photoFileName: string | null;
    role: Role;
  };
};

export type GetUsersResponse = {
  message: string;
  meta: {
    total: number;
  };
  data: Array<
    Required<CreateUserBody> & { id: string & tags.Format<"uuid">; photoFileName: string | null; role: Role }
  >;
};
