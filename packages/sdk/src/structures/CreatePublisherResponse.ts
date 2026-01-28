import type { Format } from "typia/lib/tags/Format";

export type CreatePublisherResponse = {
  message: string;
  data: {
    publisherId: string & Format<"uuid">;
  };
};
