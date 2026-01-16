import type { Format } from "typia/lib/tags/Format";
import type { MinLength } from "typia/lib/tags/MinLength";

export type SignUpBody = {
  email: string & Format<"email">;
  firstName: string;
  password: string & Format<"password"> & MinLength<6>;
  lastName?: null | undefined | string;
};
