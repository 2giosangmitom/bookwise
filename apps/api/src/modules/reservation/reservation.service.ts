import { Reservation } from "@/database/entities/reservation";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateReservationBody } from "./reservation.dto";
import { BookService } from "../book/book.service";
import { UserService } from "../user/user.service";

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation) private reservationRepository: Repository<Reservation>,
    private bookService: BookService,
    private userService: UserService,
  ) {}

  async create(data: CreateReservationBody) {
    const books = await this.bookService.findByIds(data.books);
    const user = await this.userService.findById(data.user);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const reservation = this.reservationRepository.create({
      books,
      time: data.time,
      user: user,
    });

    return this.reservationRepository.save(reservation);
  }
}
