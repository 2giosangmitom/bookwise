import type { Format } from "typia/lib/tags/Format";

export type CreateReservationResponse = {
  message: string;
  data: {
    id: string & Format<"uuid">;
  };
};
