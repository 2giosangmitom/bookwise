import type { ReservationDto } from "./ReservationDto";

export type GetReservationsResponse = {
  message: string;
  meta?:
    | undefined
    | {
        nextCursor?: null | undefined | string;
      };
  data: {
    reservations: ReservationDto[];
  };
};
