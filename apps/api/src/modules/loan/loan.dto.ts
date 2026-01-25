import { tags } from "typia";

export type CreateLoanBody = {
  user: string & tags.Format<"uuid">;
  loanDate: string & tags.Format<"date-time">;
  dueDate: string & tags.Format<"date-time">;
  bookCopies: (string & tags.Format<"uuid">)[];
};

export type CreateLoanResponse = {
  message: string;
  data: { id: string & tags.Format<"uuid"> };
};

export type LoanBookDto = {
  id: string & tags.Format<"uuid">;
  barcode: string;
  book: { id: string & tags.Format<"uuid">; title: string; isbn: string };
};

export type LoanDto = {
  id: string & tags.Format<"uuid">;
  loanDate: string & tags.Format<"date-time">;
  dueDate: string & tags.Format<"date-time">;
  returnDate?: string & tags.Format<"date-time">;
  bookCopies: LoanBookDto[];
};

export type GetLoansResponse = {
  message: string;
  meta?: { nextCursor?: string | null };
  data: {
    loans: LoanDto[];
  };
};
