import { tags } from "typia";
import { BookCondition, BookStatus } from "@bookwise/shared";

// Create book copy
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

// Update book copy
export type UpdateBookCopyBody = Partial<Omit<CreateBookCopyBody, "bookId">>;

// Get book copy
export type GetBookCopyResponse = {
  id: string & tags.Format<"uuid">;
  barcode: string;
  status: BookStatus;
  condition: BookCondition;
  book: {
    id: string & tags.Format<"uuid">;
    title: string;
    isbn: string;
  };
};

// Get book copies
export type GetBookCopiesResponse = {
  message: string;
  meta: { total: number };
  data: Array<GetBookCopyResponse>;
};

export type SearchBookCopiesQuery = {
  search?: string;
  page?: number & tags.Type<"uint32"> & tags.Minimum<1>;
  limit?: number & tags.Type<"uint32"> & tags.Minimum<1> & tags.Maximum<100>;
  status?: BookStatus;
  condition?: BookCondition;
};
