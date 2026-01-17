import type { Format } from "typia/lib/tags/Format";
import type { MinLength } from "typia/lib/tags/MinLength";

export type CreateBookCopyBody = {
  bookId: string & Format<"uuid">;
  barcode: string & MinLength<1>;
  status?: undefined | "AVAILABLE" | "BORROWED";
  condition?: undefined | "NEW" | "GOOD" | "WORN" | "DAMAGED" | "LOST";
};
