import type { Format } from "typia/lib/tags/Format";

export type GetAuthorResponse = {
  id: string & Format<"uuid">;
  name: string;
  biography: string;
  dateOfBirth: string & Format<"date-time">;
  dateOfDeath: null | (string & Format<"date-time">);
  slug: string;
  photoFileName: null | string;
  books: {
    id: string & Format<"uuid">;
    title: string;
    isbn: string;
  }[];
};
