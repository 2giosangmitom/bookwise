import type { GetBookResponse } from "./GetBookResponse";

export type SearchBooksResponse = {
  books: GetBookResponse[];
  total: number;
  limit: number;
  offset: number;
};
