import type { Format } from "typia/lib/tags/Format";

export type CreateBookResponse = {
  message: string;
  data: {
    bookId: string & Format<"uuid">;
  };
};
