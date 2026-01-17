import type { Format } from "typia/lib/tags/Format";

export type CreateBookCopyResponse = {
  message: string;
  data: {
    bookCopyId: string & Format<"uuid">;
  };
};
