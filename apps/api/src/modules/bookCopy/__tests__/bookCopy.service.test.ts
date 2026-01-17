import { beforeEach, describe, it, jest, expect } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { BookCopy } from "@/database/entities/bookCopy";
import { Book } from "@/database/entities/book";
import { BookCopyService } from "../bookCopy.service";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { BookStatus, BookCondition } from "@bookwise/shared";
import { BookService } from "../../book/book.service";

describe("BookCopyService", () => {
  let bookCopyService: BookCopyService;

  const mockBook = {
    id: "book-uuid",
    title: "Test Book",
  } as Book;

  const mockBookCopy = {
    id: "copy-uuid",
    book: mockBook,
    barcode: "TEST123",
    status: BookStatus.AVAILABLE,
    condition: BookCondition.NEW,
  } as BookCopy;

  const mockBookCopyRepository = {
    existsBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockBookService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        BookCopyService,
        {
          provide: getRepositoryToken(BookCopy),
          useValue: mockBookCopyRepository,
        },
        {
          provide: BookService,
          useValue: mockBookService,
        },
      ],
    }).compile();

    bookCopyService = moduleRef.get(BookCopyService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should throw ConflictException when barcode already exists", async () => {
      mockBookService.findById.mockImplementationOnce(async () => mockBook);
      mockBookCopyRepository.existsBy.mockImplementationOnce(async () => true);

      await expect(
        bookCopyService.create({
          bookId: "book-uuid",
          barcode: "EXISTING123",
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockBookCopyRepository.save).not.toHaveBeenCalled();
    });

    it("should check barcode existence using existsBy with correct filter", async () => {
      mockBookService.findById.mockImplementationOnce(async () => mockBook);
      mockBookCopyRepository.existsBy.mockImplementationOnce(async () => false);

      await bookCopyService.create({
        bookId: "book-uuid",
        barcode: "TEST123",
      });

      expect(mockBookCopyRepository.existsBy).toHaveBeenCalledWith({
        barcode: "TEST123",
      });
    });

    it("should save the book copy to database if barcode is available", async () => {
      const dto = {
        bookId: "book-uuid",
        barcode: "TEST123",
        status: BookStatus.AVAILABLE,
        condition: BookCondition.NEW,
      };

      mockBookService.findById.mockImplementationOnce(async () => mockBook);
      mockBookCopyRepository.existsBy.mockImplementationOnce(async () => false);
      mockBookCopyRepository.create.mockReturnValueOnce(mockBookCopy);

      await bookCopyService.create(dto);

      expect(mockBookCopyRepository.create).toHaveBeenCalledWith({
        book: mockBook,
        barcode: "TEST123",
        status: BookStatus.AVAILABLE,
        condition: BookCondition.NEW,
      });
      expect(mockBookCopyRepository.save).toHaveBeenCalledTimes(1);
    });

    it("should throw NotFoundException when deleting non-existent book copy", async () => {
      mockBookCopyRepository.findOneBy.mockImplementationOnce(async () => null);

      await expect(bookCopyService.delete("non-existent-id")).rejects.toThrow(NotFoundException);
      expect(mockBookCopyRepository.delete).not.toHaveBeenCalled();
    });

    it("should delete book copy successfully when found", async () => {
      const mockBookCopy = {
        id: "copy-uuid",
        barcode: "TEST123",
      };

      mockBookCopyRepository.findOneBy.mockImplementationOnce(async () => mockBookCopy);

      await bookCopyService.delete("copy-uuid");

      expect(mockBookCopyRepository.findOneBy).toHaveBeenCalledWith({ id: "copy-uuid" });
      expect(mockBookCopyRepository.delete).toHaveBeenCalledWith("copy-uuid");
    });
  });

  describe("update", () => {
    it("should throw NotFoundException when updating non-existent book copy", async () => {
      mockBookCopyRepository.findOneBy.mockImplementationOnce(async () => null);

      await expect(bookCopyService.update("non-existent-id", { barcode: "NEW123" })).rejects.toThrow(NotFoundException);
      expect(mockBookCopyRepository.update).not.toHaveBeenCalled();
    });

    it("should throw ConflictException when updating with existing barcode", async () => {
      const existingBookCopy = { id: "copy-uuid", barcode: "old-barcode" };
      mockBookCopyRepository.findOneBy.mockImplementationOnce(async () => existingBookCopy);
      mockBookCopyRepository.existsBy.mockImplementationOnce(async () => true);

      await expect(bookCopyService.update("copy-uuid", { barcode: "existing-barcode" })).rejects.toThrow(
        ConflictException,
      );
      expect(mockBookCopyRepository.update).not.toHaveBeenCalled();
    });

    it("should update book copy successfully", async () => {
      const existingBookCopy = {
        id: "copy-uuid",
        barcode: "old-barcode",
        status: BookStatus.AVAILABLE,
        condition: BookCondition.NEW,
      };

      mockBookCopyRepository.findOneBy.mockImplementationOnce(async () => existingBookCopy);
      mockBookCopyRepository.update.mockImplementationOnce(async () => ({
        affected: 1,
      }));

      await bookCopyService.update("copy-uuid", {
        barcode: "new-barcode",
        status: BookStatus.BORROWED,
        condition: BookCondition.GOOD,
      });

      expect(mockBookCopyRepository.update).toHaveBeenCalledWith("copy-uuid", {
        barcode: "new-barcode",
        status: BookStatus.BORROWED,
        condition: BookCondition.GOOD,
      });
    });
  });

  describe("findById", () => {
    it("should return book copy with book relation when found", async () => {
      const mockBookCopyWithRelation = {
        id: "copy-uuid",
        book: { id: "book-uuid", title: "Test Book", isbn: "978-0123456789" },
        barcode: "TEST123",
        status: BookStatus.AVAILABLE,
        condition: BookCondition.NEW,
        loans: [],
      };

      mockBookCopyRepository.findOne.mockImplementationOnce(() => mockBookCopyWithRelation);

      const result = await bookCopyService.findById("copy-uuid");

      expect(mockBookCopyRepository.findOne).toHaveBeenCalledWith({
        where: { id: "copy-uuid" },
        relations: ["book"],
      });
      expect(result).toEqual(mockBookCopyWithRelation);
    });

    it("should return null when book copy not found", async () => {
      mockBookCopyRepository.findOne.mockImplementationOnce(() => null);

      const result = await bookCopyService.findById("nonexistent-id");

      expect(mockBookCopyRepository.findOne).toHaveBeenCalledWith({
        where: { id: "nonexistent-id" },
        relations: ["book"],
      });
      expect(result).toBeNull();
    });
  });
});
