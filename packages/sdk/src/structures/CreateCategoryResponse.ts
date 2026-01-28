import type { Format } from "typia/lib/tags/Format";

export type CreateCategoryResponse = {
  message: string;
  data: {
    categoryId: string & Format<"uuid">;
  };
};
