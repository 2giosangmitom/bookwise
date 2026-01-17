import type { Format } from "typia/lib/tags/Format";

export type GetAuthorResponse = {
  id: string & Format<"uuid">;
  name: string;
  biography: string;
  dateOfBirth: string & Format<"date">;
  dateOfDeath: null | (string & Format<"date">);
  slug: string;
  photoFileName: null | string;
  books: {
    id: string & Format<"uuid">;
    title: string;
    isbn: string;
  }[];
};
