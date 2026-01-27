import type { Format } from "typia/lib/tags/Format";
import type { MinLength } from "typia/lib/tags/MinLength";

export type CreateAuthorBody = {
  name: string;
  biography: string;
  dateOfBirth: string & Format<"date-time">;
  dateOfDeath?: null | undefined | (string & Format<"date-time">);
  slug: string & MinLength<1>;
};
