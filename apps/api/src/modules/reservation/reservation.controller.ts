import { Controller } from "@nestjs/common";
import { Auth, Roles } from "@/guards/auth";
import { ReservationService } from "./reservation.service";
import { TypedRoute } from "@nestia/core";
import { CreateReservationResponse, type CreateReservationBody } from "./reservation.dto";
import { ApiTags } from "@nestjs/swagger";
import { Role } from "@bookwise/shared";

@Controller("reservation")
@ApiTags("Reservation")
@Auth()
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @TypedRoute.Post()
  @Roles([Role.ADMIN, Role.LIBRARIAN])
  async createReservation(data: CreateReservationBody): Promise<CreateReservationResponse> {
    const reservation = await this.reservationService.create(data);

    return {
      message: "Reservation created successfully",
      data: { id: reservation.id },
    };
  }
}
