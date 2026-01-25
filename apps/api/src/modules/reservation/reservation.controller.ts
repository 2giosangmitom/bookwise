import { Controller, Req, Query } from "@nestjs/common";
import { Auth } from "@/guards/auth";
import { ReservationService } from "./reservation.service";
import { TypedBody, TypedRoute } from "@nestia/core";
import { CreateReservationResponse, type CreateReservationBody, type GetReservationsResponse } from "./reservation.dto";
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
    @TypedBody() data: CreateReservationBody,
  ): Promise<CreateReservationResponse> {
    const user = request.getDecorator("user") as User;
    const reservation = await this.reservationService.create(data, user);

    return {
      message: "Reservation created successfully",
      data: { id: reservation.id },
    };
  }

  @TypedRoute.Get("/")
  async getReservations(
    @Req() request: FastifyRequest,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: number,
  ): Promise<GetReservationsResponse> {
    const user = request.getDecorator("user") as User;

    const { items, nextCursor } = await this.reservationService.findByUserWithCursor(user.id, cursor, limit);

    return {
      message: "Reservations fetched successfully",
      meta: { nextCursor: nextCursor },
      data: {
        reservations: items.map((r) => ({
          id: r.id,
          time: r.time.toISOString(),
          books: r.books.map((b) => ({ id: b.id, title: b.title, isbn: b.isbn })),
          createdAt: r.createdAt.toISOString(),
        })),
      },
    };
  }
}
