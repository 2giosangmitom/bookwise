import type { MinLength } from "typia/lib/tags/MinLength";

/**
 * Make all properties in T optional
 */
export type PartialCreateCategoryBody = {
  name?: undefined | string;
  slug?: undefined | (string & MinLength<1>);
};
