import { tags } from "typia";

export type CreateBookBody = {
  title: string;
  description: string;
  isbn: string;
  publishedDate: string & tags.Format<"date">;
  photoFileName?: string | null;
  authorIds: string[] & tags.MinItems<1>;
  categoryIds: string[] & tags.MinItems<1>;
  publisherIds: string[] & tags.MinItems<1>;
};

export type CreateBookResponse = {
  message: string;
  data: {
    bookId: string & tags.Format<"uuid">;
  };
};

export type UpdateBookBody = {
  title?: string;
  description?: string;
  isbn?: string;
  publishedDate?: string & tags.Format<"date">;
  photoFileName?: string | null;
  authorIds?: string[] & tags.MinItems<1>;
  categoryIds?: string[] & tags.MinItems<1>;
  publisherIds?: string[] & tags.MinItems<1>;
};
