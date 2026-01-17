import type { Format } from "typia/lib/tags/Format";
import type { MinItems } from "typia/lib/tags/MinItems";

export type CreateBookBody = {
  title: string;
  description: string;
  isbn: string;
  publishedDate: string & Format<"date">;
  authorIds: string[] & MinItems<1>;
  categoryIds: string[] & MinItems<1>;
  publisherIds: string[] & MinItems<1>;
};
