import type { Format } from "typia/lib/tags/Format";

export type GetAuthorsResponse = {
  message: string;
  meta: {
    total: number;
  };
  data: {
    id: string & Format<"uuid">;
    name: string;
    slug: string;
    biography: string;
    photoFileName: null | string;
    dateOfBirth: string & Format<"date-time">;
    dateOfDeath: null | (string & Format<"date-time">);
  }[];
};
