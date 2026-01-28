import type { Format } from "typia/lib/tags/Format";
import type { MinLength } from "typia/lib/tags/MinLength";

export type RequiredCreateCategoryBodyidstringFormatuuid = {
  name: string;
  slug: string & MinLength<1>;
  id: string & Format<"uuid">;
};
