import { Body, Controller, Req } from "@nestjs/common";
import { Auth } from "@/guards/auth";
import { ReservationService } from "./reservation.service";
import { TypedRoute } from "@nestia/core";
import { CreateReservationResponse, type CreateReservationBody } from "./reservation.dto";
import { ApiTags } from "@nestjs/swagger";
import { type FastifyRequest } from "fastify";
import { User } from "@/database/entities/user";

@Controller("/reservation")
@ApiTags("Reservation")
@Auth()
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @TypedRoute.Post()
  async createReservation(
    @Req() request: FastifyRequest,
    @Body() data: CreateReservationBody,
  ): Promise<CreateReservationResponse> {
    const user = request.getDecorator("user") as User;
    const reservation = await this.reservationService.create(data, user);

    return {
      message: "Reservation created successfully",
      data: { id: reservation.id },
    };
  }
}
