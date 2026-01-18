import type { Format } from "typia/lib/tags/Format";
import type { MinLength } from "typia/lib/tags/MinLength";

export type SignInBody = {
  email: string & Format<"email">;
  password: string & Format<"password"> & MinLength<6>;
};
