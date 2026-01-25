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

  // Cursor pagination: cursor is reservation.createdAt ISO string, limit is number of items to fetch
  async findByUserWithCursor(
    userId: string,
    cursor?: string,
    limit?: number,
  ): Promise<{ items: Reservation[]; nextCursor: string | null }> {
    const take = limit && limit > 0 ? limit : 10;

    const qb = this.reservationRepository
      .createQueryBuilder("reservation")
      .leftJoinAndSelect("reservation.books", "book")
      .where("reservation.userId = :userId", { userId })
      .orderBy("reservation.time", "DESC")
      .take(take + 1);

    if (cursor) {
      // cursor is an ISO datetime string; for DESC order we want time < cursor
      qb.andWhere("reservation.time < :cursor", { cursor: new Date(cursor) });
    }

    const results = await qb.getMany();

    const hasMore = results.length > take;
    const items = hasMore ? results.slice(0, take) : results;
    const nextCursor = hasMore ? items[items.length - 1].time.toISOString() : null;

    return { items, nextCursor };
  }
}
