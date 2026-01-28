import type { MinLength } from "typia/lib/tags/MinLength";

export type CreatePublisherBody = {
  name: string;
  description: string;
  website: string;
  slug: string & MinLength<1>;
};
