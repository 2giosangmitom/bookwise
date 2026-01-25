import type { Format } from "typia/lib/tags/Format";

export type ReservationDto = {
  id: string & Format<"uuid">;
  time: string & Format<"date-time">;
  createdAt: string & Format<"date-time">;
  books: {
    id: string & Format<"uuid">;
    title: string;
    isbn: string;
  }[];
};
