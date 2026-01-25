import type { Format } from "typia/lib/tags/Format";
import type { MinLength } from "typia/lib/tags/MinLength";

export type ChangePasswordBody = {
  newPassword: string & Format<"password"> & MinLength<6>;
};
