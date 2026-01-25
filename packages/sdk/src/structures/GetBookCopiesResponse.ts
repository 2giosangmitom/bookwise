import type { GetBookCopyResponse } from "./GetBookCopyResponse";

export type GetBookCopiesResponse = {
  message: string;
  meta: {
    total: number;
  };
  data: GetBookCopyResponse[];
};
