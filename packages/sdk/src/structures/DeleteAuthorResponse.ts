import type { Format } from "typia/lib/tags/Format";

export type DeleteAuthorResponse = {
  message: string;
  data: {
    name: string;
    biography: string;
    dateOfBirth: string & Format<"date">;
    dateOfDeath: null | (string & Format<"date">);
    photoFileName: null | string;
    slug: string;
  };
};
