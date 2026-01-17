import type { Format } from "typia/lib/tags/Format";

export type GetBookCopyResponse = {
  id: string & Format<"uuid">;
  barcode: string;
  status: "AVAILABLE" | "BORROWED";
  condition: "NEW" | "GOOD" | "WORN" | "DAMAGED" | "LOST";
  book: {
    id: string & Format<"uuid">;
    title: string;
    isbn: string;
  };
};
