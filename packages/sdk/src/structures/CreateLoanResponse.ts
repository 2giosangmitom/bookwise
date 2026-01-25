import type { Format } from "typia/lib/tags/Format";

export type CreateLoanResponse = {
  message: string;
  data: {
    id: string & Format<"uuid">;
  };
};
