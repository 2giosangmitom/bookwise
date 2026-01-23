import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reservation } from "@/database/entities/reservation";
import { BookModule } from "../book/book.module";
import { UserModule } from "../user/user.module";
import { ReservationController } from "./reservation.controller";
import { ReservationService } from "./reservation.service";

@Module({
  imports: [TypeOrmModule.forFeature([Reservation]), BookModule, UserModule],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
