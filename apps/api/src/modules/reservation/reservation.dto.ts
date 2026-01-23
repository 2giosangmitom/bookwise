import { tags } from "typia";

export type CreateReservationBody = {
  user: string & tags.Format<"uuid">;
  time: string & tags.Format<"date-time">;
  books: (string & tags.Format<"uuid">)[];
};

export type CreateReservationResponse = {
  message: string;
  data: {
    id: string & tags.Format<"uuid">;
  };
};
