import type { MinLength } from "typia/lib/tags/MinLength";

/**
 * Make all properties in T optional
 */
export type PartialCreatePublisherBody = {
  name?: undefined | string;
  description?: undefined | string;
  website?: undefined | string;
  slug?: undefined | (string & MinLength<1>);
};
