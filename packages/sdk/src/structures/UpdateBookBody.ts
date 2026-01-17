import type { Format } from "typia/lib/tags/Format";
import type { MinItems } from "typia/lib/tags/MinItems";

export type UpdateBookBody = {
  title?: undefined | string;
  description?: undefined | string;
  isbn?: undefined | string;
  publishedDate?: undefined | (string & Format<"date">);
  authorIds?: undefined | (string[] & MinItems<1>);
  categoryIds?: undefined | (string[] & MinItems<1>);
  publisherIds?: undefined | (string[] & MinItems<1>);
};
