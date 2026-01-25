import type { Format } from "typia/lib/tags/Format";

import type { LoanBookDto } from "./LoanBookDto";

export type LoanDto = {
  id: string & Format<"uuid">;
  loanDate: string & Format<"date-time">;
  dueDate: string & Format<"date-time">;
  returnDate?: undefined | (string & Format<"date-time">);
  bookCopies: LoanBookDto[];
};
