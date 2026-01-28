import type { Format } from "typia/lib/tags/Format";
import type { MinLength } from "typia/lib/tags/MinLength";

export type CreateAuthorBody = {
  name: string;
  biography: string;
  dateOfBirth: string & Format<"date">;
  dateOfDeath?: null | undefined | (string & Format<"date">);
  slug: string & MinLength<1>;
};
