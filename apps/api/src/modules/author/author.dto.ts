import { tags } from "typia";

export type CreateAuthorBody = {
  name: string;
  biography: string;
  dateOfBirth: string & tags.Format<"date">;
  dateOfDeath?: (string & tags.Format<"date">) | null;
  slug: string & tags.MinLength<1>;
};

export type CreateAuthorResponse = {
  message: string;
  data: {
    authorId: string & tags.Format<"uuid">;
  };
};

export type DeleteAuthorResponse = {
  message: string;
  data: {
    name: string;
    biography: string;
    dateOfBirth: string & tags.Format<"date">;
    dateOfDeath: (string & tags.Format<"date">) | null;
    photoFileName: string | null;
    slug: string;
  };
};
