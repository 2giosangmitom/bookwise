import { beforeEach, describe, it, jest, expect } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BookCopyService } from "../bookCopy.service";
import { BookCopy } from "@/database/entities/bookCopy";
import { Book } from "@/database/entities/book";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { BookStatus, BookCondition } from "@bookwise/shared";
import { BookService } from "../../book/book.service";

describe("BookCopyService", () => {
  let service: BookCopyService;
  let bookCopyRepository: jest.Mocked<Repository<BookCopy>>;
  let bookService: jest.Mocked<BookService>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookCopyService,
        {
          provide: getRepositoryToken(BookCopy),
          useValue: {
            existsBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: BookService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookCopyService>(BookCopyService);
    bookCopyRepository = module.get(getRepositoryToken(BookCopy));
    bookService = module.get(BookService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a book copy successfully", async () => {
      const createData = {
        bookId: "book-uuid",
        barcode: "TEST123",
        status: BookStatus.AVAILABLE,
        condition: BookCondition.NEW,
      };

      bookService.findById.mockResolvedValue(mockBook);
      bookCopyRepository.existsBy.mockResolvedValue(false);
      bookCopyRepository.create.mockReturnValue(mockBookCopy);
      bookCopyRepository.save.mockResolvedValue(mockBookCopy);

      const result = await service.create(createData);

      expect(bookService.findById).toHaveBeenCalledWith(createData.bookId);
      expect(bookCopyRepository.existsBy).toHaveBeenCalledWith({ barcode: createData.barcode });
      expect(bookCopyRepository.create).toHaveBeenCalledWith({
        book: mockBook,
        barcode: createData.barcode,
        status: createData.status,
        condition: createData.condition,
      });
      expect(bookCopyRepository.save).toHaveBeenCalledWith(mockBookCopy);
      expect(result).toEqual(mockBookCopy);
    });

    it("should throw NotFoundException when book does not exist", async () => {
      const createData = {
        bookId: "nonexistent-uuid",
        barcode: "TEST123",
      };

      bookService.findById.mockResolvedValue(null);

      await expect(service.create(createData)).rejects.toThrow(NotFoundException);
      expect(bookService.findById).toHaveBeenCalledWith(createData.bookId);
      expect(bookCopyRepository.existsBy).not.toHaveBeenCalled();
    });

    it("should throw ConflictException when barcode already exists", async () => {
      const createData = {
        bookId: "book-uuid",
        barcode: "EXISTING123",
      };

      bookService.findById.mockResolvedValue(mockBook);
      bookCopyRepository.existsBy.mockResolvedValue(true);

      await expect(service.create(createData)).rejects.toThrow(ConflictException);
      expect(bookService.findById).toHaveBeenCalledWith(createData.bookId);
      expect(bookCopyRepository.existsBy).toHaveBeenCalledWith({ barcode: createData.barcode });
      expect(bookCopyRepository.create).not.toHaveBeenCalled();
    });

    it("should use default values when status and condition are not provided", async () => {
      const createData = {
        bookId: "book-uuid",
        barcode: "TEST123",
      };

      const expectedBookCopy = {
        ...mockBookCopy,
        status: BookStatus.AVAILABLE,
        condition: BookCondition.NEW,
      };

      bookService.findById.mockResolvedValue(mockBook);
      bookCopyRepository.existsBy.mockResolvedValue(false);
      bookCopyRepository.create.mockReturnValue(expectedBookCopy);
      bookCopyRepository.save.mockResolvedValue(expectedBookCopy);

      const result = await service.create(createData);

      expect(bookCopyRepository.create).toHaveBeenCalledWith({
        book: mockBook,
        barcode: createData.barcode,
        status: BookStatus.AVAILABLE,
        condition: BookCondition.NEW,
      });
      expect(result).toEqual(expectedBookCopy);
    });
  });

  describe("delete", () => {
    it("should delete a book copy successfully", async () => {
      const bookCopyId = "copy-uuid";

      bookCopyRepository.findOneBy.mockResolvedValue(mockBookCopy);
      bookCopyRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      await service.delete(bookCopyId);

      expect(bookCopyRepository.findOneBy).toHaveBeenCalledWith({ id: bookCopyId });
      expect(bookCopyRepository.delete).toHaveBeenCalledWith(bookCopyId);
    });

    it("should throw NotFoundException when book copy does not exist", async () => {
      const nonExistentId = "nonexistent-uuid";

      bookCopyRepository.findOneBy.mockResolvedValue(null);

      await expect(service.delete(nonExistentId)).rejects.toThrow(NotFoundException);
      expect(bookCopyRepository.findOneBy).toHaveBeenCalledWith({ id: nonExistentId });
      expect(bookCopyRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    const mockUpdatedBook = {
      id: "updated-book-uuid",
      title: "Updated Test Book",
    } as Book;

    it("should update a book copy successfully", async () => {
      const bookCopyId = "copy-uuid";
      const updateData = {
        barcode: "UPDATED123",
        status: BookStatus.BORROWED,
        condition: BookCondition.GOOD,
      };

      bookCopyRepository.findOneBy.mockResolvedValue(mockBookCopy);
      bookCopyRepository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });
      bookService.findById.mockResolvedValue(mockBook);

      const result = await service.update(bookCopyId, updateData);

      expect(bookCopyRepository.findOneBy).toHaveBeenCalledWith({ id: bookCopyId });
      expect(bookCopyRepository.update).toHaveBeenCalledWith(bookCopyId, {
        barcode: "UPDATED123",
        status: BookStatus.BORROWED,
        condition: BookCondition.GOOD,
      });
      expect(result).toBe(1);
    });

    it("should update only provided fields", async () => {
      const bookCopyId = "copy-uuid";
      const updateData = {
        condition: BookCondition.WORN,
      };

      bookCopyRepository.findOneBy.mockResolvedValue(mockBookCopy);
      bookCopyRepository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      await service.update(bookCopyId, updateData);

      expect(bookCopyRepository.update).toHaveBeenCalledWith(bookCopyId, {
        condition: BookCondition.WORN,
      });
    });

    it("should throw NotFoundException when book copy does not exist", async () => {
      const nonExistentId = "nonexistent-uuid";
      const updateData = { barcode: "NEW123" };

      bookCopyRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(nonExistentId, updateData)).rejects.toThrow(NotFoundException);
      expect(bookCopyRepository.findOneBy).toHaveBeenCalledWith({ id: nonExistentId });
      expect(bookCopyRepository.update).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when updating to non-existent book", async () => {
      const bookCopyId = "copy-uuid";
      const updateData = { bookId: "nonexistent-book-uuid" };

      bookCopyRepository.findOneBy.mockResolvedValue(mockBookCopy);
      bookService.findById.mockResolvedValue(null);

      await expect(service.update(bookCopyId, updateData)).rejects.toThrow(NotFoundException);
      expect(bookCopyRepository.findOneBy).toHaveBeenCalledWith({ id: bookCopyId });
      expect(bookService.findById).toHaveBeenCalledWith(updateData.bookId);
      expect(bookCopyRepository.update).not.toHaveBeenCalled();
    });

    it("should throw ConflictException when updating to existing barcode", async () => {
      const bookCopyId = "copy-uuid";
      const updateData = { barcode: "EXISTING123" };

      bookCopyRepository.findOneBy.mockResolvedValue(mockBookCopy);
      bookCopyRepository.existsBy.mockResolvedValue(true);

      await expect(service.update(bookCopyId, updateData)).rejects.toThrow(ConflictException);
      expect(bookCopyRepository.findOneBy).toHaveBeenCalledWith({ id: bookCopyId });
      expect(bookCopyRepository.existsBy).toHaveBeenCalledWith({ barcode: updateData.barcode });
      expect(bookCopyRepository.update).not.toHaveBeenCalled();
    });

    it("should allow updating to same barcode", async () => {
      const bookCopyId = "copy-uuid";
      const updateData = { barcode: "TEST123" }; // Same as existing

      bookCopyRepository.findOneBy.mockResolvedValue(mockBookCopy);
      bookCopyRepository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      await service.update(bookCopyId, updateData);

      expect(bookCopyRepository.existsBy).not.toHaveBeenCalled();
      expect(bookCopyRepository.update).toHaveBeenCalledWith(bookCopyId, {
        barcode: "TEST123",
      });
    });

    it("should update book when bookId is provided", async () => {
      const bookCopyId = "copy-uuid";
      const updateData = { bookId: "updated-book-uuid" };

      bookCopyRepository.findOneBy.mockResolvedValue(mockBookCopy);
      bookService.findById.mockResolvedValue(mockUpdatedBook);
      bookCopyRepository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      await service.update(bookCopyId, updateData);

      expect(bookService.findById).toHaveBeenCalledWith(updateData.bookId);
      expect(bookCopyRepository.update).toHaveBeenCalledWith(bookCopyId, {
        book: mockUpdatedBook,
      });
    });
  });
});
