import type { Format } from "typia/lib/tags/Format";
import type { MinLength } from "typia/lib/tags/MinLength";

/**
 * Make all properties in T optional
 */
export type PartialCreateAuthorBody = {
  name?: undefined | string;
  biography?: undefined | string;
  dateOfBirth?: undefined | (string & Format<"date-time">);
  dateOfDeath?: null | undefined | (string & Format<"date-time">);
  slug?: undefined | (string & MinLength<1>);
};
