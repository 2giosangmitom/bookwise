import { tags } from "typia";

export type CreateCategoryBody = {
  name: string;
  slug: string & tags.MinLength<1>;
};

export type CreateCategoryResponse = {
  message: string;
  data: {
    categoryId: string & tags.Format<"uuid">;
  };
};

export type UpdateCategoryBody = Partial<CreateCategoryBody>;

export type GetCategoryResponse = Required<CreateCategoryBody> & {
  id: string & tags.Format<"uuid">;
  books: Array<{
    id: string & tags.Format<"uuid">;
    title: string;
    isbn: string;
  }>;
};

export type GetCategoriesResponse = {
  message: string;
  meta: {
    total: number;
  };
  data: Array<Required<CreateCategoryBody> & { id: string & tags.Format<"uuid"> }>;
};
