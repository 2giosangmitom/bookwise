import type { MinLength } from "typia/lib/tags/MinLength";

export type CreateCategoryBody = {
  name: string;
  slug: string & MinLength<1>;
};
