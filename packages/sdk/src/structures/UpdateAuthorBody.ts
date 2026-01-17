import type { Format } from "typia/lib/tags/Format";
import type { MinLength } from "typia/lib/tags/MinLength";

export type UpdateAuthorBody = {
  name?: undefined | string;
  biography?: undefined | string;
  dateOfBirth?: undefined | (string & Format<"date">);
  dateOfDeath?: null | undefined | (string & Format<"date">);
  slug?: undefined | (string & MinLength<1>);
};
