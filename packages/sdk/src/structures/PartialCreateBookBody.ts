import type { Format } from "typia/lib/tags/Format";
import type { MinItems } from "typia/lib/tags/MinItems";

/**
 * Make all properties in T optional
 */
export type PartialCreateBookBody = {
  title?: undefined | string;
  description?: undefined | string;
  isbn?: undefined | string;
  publishedDate?: undefined | (string & Format<"date">);
  authorIds?: undefined | ((string & Format<"uuid">)[] & MinItems<1>);
  categoryIds?: undefined | ((string & Format<"uuid">)[] & MinItems<1>);
  publisherIds?: undefined | ((string & Format<"uuid">)[] & MinItems<1>);
};
