import { tags } from "typia";

export type CreateReservationBody = {
  time: string & tags.Format<"date-time">;
  books: (string & tags.Format<"uuid">)[];
};

export type CreateReservationResponse = {
  message: string;
  data: {
    id: string & tags.Format<"uuid">;
  };
};

export type ReservationDto = {
  id: string & tags.Format<"uuid">;
  time: string & tags.Format<"date-time">;
  createdAt: string & tags.Format<"date-time">;
  books: { id: string & tags.Format<"uuid">; title: string; isbn: string }[];
};

export type GetReservationsResponse = {
  message: string;
  meta?: { nextCursor?: string | null };
  data: {
    reservations: ReservationDto[];
  };
};
