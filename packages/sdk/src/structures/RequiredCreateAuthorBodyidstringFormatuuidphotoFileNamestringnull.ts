import type { Format } from "typia/lib/tags/Format";
import type { MinLength } from "typia/lib/tags/MinLength";

export type RequiredCreateAuthorBodyidstringFormatuuidphotoFileNamestringnull =
  {
    name: string;
    biography: string;
    dateOfBirth: string & Format<"date">;
    dateOfDeath: null | (string & Format<"date">);
    slug: string & MinLength<1>;
    id: string & Format<"uuid">;
    photoFileName: null | string;
  };
