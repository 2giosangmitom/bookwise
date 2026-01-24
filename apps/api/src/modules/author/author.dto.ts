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

export type UpdateAuthorBody = Partial<CreateAuthorBody>;

export type GetAuthorResponse = {
  id: string & tags.Format<"uuid">;
  name: string;
  biography: string;
  dateOfBirth: string & tags.Format<"date">;
  dateOfDeath: (string & tags.Format<"date">) | null;
  slug: string;
  photoFileName: string | null;
  books: Array<{
    id: string & tags.Format<"uuid">;
    title: string;
    isbn: string;
  }>;
};

export type GetAuthorsResponse = {
  message: string;
  meta: {
    total: number;
  };
  data: Array<{
    id: string & tags.Format<"uuid">;
    name: string;
    slug: string;
    biography: string;
    photoFileName: string | null;
    dateOfBirth: string & tags.Format<"date">;
    dateOfDeath: (string & tags.Format<"date">) | null;
  }>;
};
