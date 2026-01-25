import type { Format } from "typia/lib/tags/Format";

export type CreateReservationBody = {
  time: string & Format<"date-time">;
  books: (string & Format<"uuid">)[];
};
