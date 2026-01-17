import type { Format } from "typia/lib/tags/Format";

export type GetBookResponse = {
  id: string & Format<"uuid">;
  title: string;
  description: string;
  photoFileName: null | string;
  isbn: string;
  publishedDate: string & Format<"date">;
  authors: {
    id: string & Format<"uuid">;
    name: string;
    slug: string;
  }[];
  categories: {
    id: string & Format<"uuid">;
    name: string;
    slug: string;
  }[];
  publishers: {
    id: string & Format<"uuid">;
    name: string;
    slug: string;
  }[];
};
