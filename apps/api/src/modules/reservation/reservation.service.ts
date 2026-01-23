import { Reservation } from "@/database/entities/reservation";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateReservationBody } from "./reservation.dto";
import { BookService } from "../book/book.service";
import { User } from "@/database/entities/user";

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation) private reservationRepository: Repository<Reservation>,
    private bookService: BookService,
  ) {}

  async create(data: CreateReservationBody, user: User): Promise<Reservation> {
    const books = await this.bookService.findByIds(data.books);

    const reservation = this.reservationRepository.create({
      books,
      time: data.time,
      user,
    });

    return this.reservationRepository.save(reservation);
  }
}
