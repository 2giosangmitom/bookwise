import type { Format } from "typia/lib/tags/Format";

export type CreateAuthorResponse = {
  message: string;
  data: {
    authorId: string & Format<"uuid">;
  };
};
