import type { Format } from "typia/lib/tags/Format";
import type { MinLength } from "typia/lib/tags/MinLength";

/**
 * Make all properties in T optional
 */
export type PartialCreateBookCopyBody = {
  bookId?: undefined | (string & Format<"uuid">);
  barcode?: undefined | (string & MinLength<1>);
  status?: undefined | "AVAILABLE" | "BORROWED";
  condition?: undefined | "NEW" | "GOOD" | "WORN" | "DAMAGED" | "LOST";
};
