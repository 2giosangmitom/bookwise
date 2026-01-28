import type { Format } from "typia/lib/tags/Format";
import type { MinLength } from "typia/lib/tags/MinLength";

export type RequiredCreatePublisherBodyidstringFormatuuidphotoFileNamestringnull =
  {
    name: string;
    description: string;
    website: string;
    slug: string & MinLength<1>;
    id: string & Format<"uuid">;
    photoFileName: null | string;
  };
