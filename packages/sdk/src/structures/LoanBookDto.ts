import type { Format } from "typia/lib/tags/Format";

export type LoanBookDto = {
  id: string & Format<"uuid">;
  barcode: string;
  book: {
    id: string & Format<"uuid">;
    title: string;
    isbn: string;
  };
};
