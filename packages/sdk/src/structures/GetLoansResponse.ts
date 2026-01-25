import type { LoanDto } from "./LoanDto";

export type GetLoansResponse = {
  message: string;
  meta?:
    | undefined
    | {
        nextCursor?: null | undefined | string;
      };
  data: {
    loans: LoanDto[];
  };
};
