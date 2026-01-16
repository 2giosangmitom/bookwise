import type { Format } from "typia/lib/tags/Format";

export type SignUpResponse = {
  message: string;
  data: {
    userId: string & Format<"uuid">;
  };
};
