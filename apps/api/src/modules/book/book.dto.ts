import { tags } from "typia";

export type CreateBookBody = {
  title: string;
  description: string;
  isbn: string;
  publishedDate: string & tags.Format<"date">;
  authorIds: (string & tags.Format<"uuid">)[] & tags.MinItems<1>;
  categoryIds: (string & tags.Format<"uuid">)[] & tags.MinItems<1>;
  publisherIds: (string & tags.Format<"uuid">)[] & tags.MinItems<1>;
};

export type CreateBookResponse = {
  message: string;
  data: {
    bookId: string & tags.Format<"uuid">;
  };
};

export type UpdateBookBody = Partial<CreateBookBody>;

export type GetBookResponse = {
  id: string & tags.Format<"uuid">;
  title: string;
  description: string;
  photoFileName: string | null;
  isbn: string;
  publishedDate: string & tags.Format<"date">;
  authors: Array<{
    id: string & tags.Format<"uuid">;
    name: string;
    slug: string;
  }>;
  categories: Array<{
    id: string & tags.Format<"uuid">;
    name: string;
    slug: string;
  }>;
  publishers: Array<{
    id: string & tags.Format<"uuid">;
    name: string;
    slug: string;
  }>;
};
