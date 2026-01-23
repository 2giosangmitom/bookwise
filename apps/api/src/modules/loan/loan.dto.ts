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
