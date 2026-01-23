import { beforeEach, describe, it, jest, expect } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ReservationService } from "../reservation.service";
import { Reservation } from "@/database/entities/reservation";
import { BookService } from "../../book/book.service";
import { UserService } from "../../user/user.service";
import { User } from "@/database/entities/user";

describe("ReservationService", () => {
  let reservationService: ReservationService;

  const mockReservationRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockBookService = {
    findByIds: jest.fn(),
  };

  const mockUserService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: getRepositoryToken(Reservation), useValue: mockReservationRepository },
        { provide: BookService, useValue: mockBookService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    reservationService = moduleRef.get(ReservationService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create reservation when user exists", async () => {
      const user = { id: "user-1" };
      const books = [{ id: "book-1" }, { id: "book-2" }];

      mockBookService.findByIds.mockImplementationOnce(async () => books);
      mockUserService.findById.mockImplementationOnce(async () => user);
      mockReservationRepository.create.mockReturnValueOnce({ id: "res-1" });

      const dto = { user: "user-1", time: new Date().toISOString(), books: ["book-1", "book-2"] };

      await reservationService.create(dto, user as User);

      expect(mockBookService.findByIds).toHaveBeenCalledWith(dto.books);
      expect(mockReservationRepository.create).toHaveBeenCalledWith({ books, time: dto.time, user });
      expect(mockReservationRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
