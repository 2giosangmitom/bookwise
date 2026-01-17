import { tags } from "typia";
import { BookCondition, BookStatus } from "@bookwise/shared";

export type CreateBookCopyBody = {
  bookId: string & tags.Format<"uuid">;
  barcode: string & tags.MinLength<1>;
  status?: BookStatus;
  condition?: BookCondition;
};

export type CreateBookCopyResponse = {
  message: string;
  data: {
    bookCopyId: string & tags.Format<"uuid">;
  };
};

export type UpdateBookCopyBody = Partial<CreateBookCopyBody>;
