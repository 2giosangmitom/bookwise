import type { Maximum } from "typia/lib/tags/Maximum";
import type { Minimum } from "typia/lib/tags/Minimum";

export type SearchBooksQuery = {
  title?: undefined | string;
  authors?: undefined | string[];
  categories?: undefined | string[];
  publishers?: undefined | string[];
  limit?: undefined | (number & Minimum<1> & Maximum<100>);
  offset?: undefined | (number & Minimum<0>);
};
