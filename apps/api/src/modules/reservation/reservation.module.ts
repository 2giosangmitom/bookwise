import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reservation } from "@/database/entities/reservation";

@Module({
  imports: [TypeOrmModule.forFeature([Reservation])],
})
export class ReservationModule {}
