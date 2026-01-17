import { beforeEach, describe, it, jest, expect } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Book } from "@/database/entities/book";
import { BookService } from "../book.service";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { AuthorService } from "../../author/author.service";
import { CategoryService } from "../../category/category.service";
import { PublisherService } from "../../publisher/publisher.service";

describe("BookService", () => {
  let bookService: BookService;

  const mockBookRepository = {
    existsBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockAuthorService = {
    existsById: jest.fn(),
    findByIds: jest.fn(),
  };

  const mockCategoryService = {
    existsById: jest.fn(),
    findByIds: jest.fn(),
  };

  const mockPublisherService = {
    existsById: jest.fn(),
    findByIds: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: getRepositoryToken(Book),
          useValue: mockBookRepository,
        },
        {
          provide: AuthorService,
          useValue: mockAuthorService,
        },
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
        {
          provide: PublisherService,
          useValue: mockPublisherService,
        },
      ],
    }).compile();

    bookService = moduleRef.get(BookService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should throw ConflictException when ISBN already exists", async () => {
      mockBookRepository.existsBy.mockImplementationOnce(async () => true);

      await expect(
        bookService.create({
          title: "Test Book",
          description: "Test Description",
          isbn: "978-0123456789",
          publishedDate: "2024-01-01",
          authorIds: ["author-1"],
          categoryIds: ["category-1"],
          publisherIds: ["publisher-1"],
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockBookRepository.save).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when authors do not exist", async () => {
      mockBookRepository.existsBy.mockImplementationOnce(async () => false);
      mockAuthorService.existsById.mockImplementationOnce(async () => false);

      await expect(
        bookService.create({
          title: "Test Book",
          description: "Test Description",
          isbn: "978-0123456789",
          publishedDate: "2024-01-01",
          authorIds: ["author-1"],
          categoryIds: ["category-1"],
          publisherIds: ["publisher-1"],
        }),
      ).rejects.toThrow(NotFoundException);
      expect(mockBookRepository.save).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when categories do not exist", async () => {
      mockBookRepository.existsBy.mockImplementationOnce(async () => false);
      mockAuthorService.existsById.mockImplementationOnce(async () => true);
      mockCategoryService.existsById.mockImplementationOnce(async () => false);

      await expect(
        bookService.create({
          title: "Test Book",
          description: "Test Description",
          isbn: "978-0123456789",
          publishedDate: "2024-01-01",
          authorIds: ["author-1"],
          categoryIds: ["category-1"],
          publisherIds: ["publisher-1"],
        }),
      ).rejects.toThrow(NotFoundException);
      expect(mockBookRepository.save).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when publishers do not exist", async () => {
      mockBookRepository.existsBy.mockImplementationOnce(async () => false);
      mockAuthorService.existsById.mockImplementationOnce(async () => true);
      mockCategoryService.existsById.mockImplementationOnce(async () => true);
      mockPublisherService.existsById.mockImplementationOnce(async () => false);

      await expect(
        bookService.create({
          title: "Test Book",
          description: "Test Description",
          isbn: "978-0123456789",
          publishedDate: "2024-01-01",
          authorIds: ["author-1"],
          categoryIds: ["category-1"],
          publisherIds: ["publisher-1"],
        }),
      ).rejects.toThrow(NotFoundException);
      expect(mockBookRepository.save).not.toHaveBeenCalled();
    });

    it("should create book successfully when all validations pass", async () => {
      const bookData = {
        title: "Test Book",
        description: "Test Description",
        isbn: "978-0123456789",
        publishedDate: "2024-01-01",
        authorIds: ["author-1", "author-2"],
        categoryIds: ["category-1"],
        publisherIds: ["publisher-1"],
      };

      const createdBook = {
        id: "book-id",
        title: "Test Book",
        description: "Test Description",
        isbn: "978-0123456789",
        publishedDate: new Date("2024-01-01"),
      };

      mockBookRepository.existsBy.mockImplementationOnce(async () => false);
      mockAuthorService.existsById.mockImplementationOnce(async () => true);
      mockCategoryService.existsById.mockImplementationOnce(async () => true);
      mockPublisherService.existsById.mockImplementationOnce(async () => true);
      mockAuthorService.findByIds.mockImplementationOnce(async () => [{ id: "author-1" }, { id: "author-2" }]);
      mockCategoryService.findByIds.mockImplementationOnce(async () => [{ id: "category-1" }]);
      mockPublisherService.findByIds.mockImplementationOnce(async () => [{ id: "publisher-1" }]);
      mockBookRepository.create.mockImplementationOnce(() => createdBook);
      mockBookRepository.save.mockImplementationOnce(() => createdBook);

      const result = await bookService.create(bookData);

      expect(mockBookRepository.create).toHaveBeenCalledWith({
        title: "Test Book",
        description: "Test Description",
        isbn: "978-0123456789",
        publishedDate: new Date("2024-01-01"),
        photoFileName: null,
        authors: [{ id: "author-1" }, { id: "author-2" }],
        categories: [{ id: "category-1" }],
        publishers: [{ id: "publisher-1" }],
      });
      expect(result).toEqual(createdBook);
    });
  });

  describe("delete", () => {
    it("should throw NotFoundException when deleting non-existent book", async () => {
      mockBookRepository.findOneBy.mockImplementationOnce(async () => null);

      await expect(bookService.delete("non-existent-id")).rejects.toThrow(NotFoundException);
      expect(mockBookRepository.delete).not.toHaveBeenCalled();
    });

    it("should delete book successfully when found", async () => {
      const mockBook = {
        id: "book-id",
        title: "Test Book",
        description: "Test Description",
        isbn: "978-0123456789",
        publishedDate: new Date("2024-01-01"),
      };

      mockBookRepository.findOneBy.mockImplementationOnce(async () => mockBook);

      await bookService.delete("book-id");

      expect(mockBookRepository.findOneBy).toHaveBeenCalledWith({ id: "book-id" });
      expect(mockBookRepository.delete).toHaveBeenCalledWith("book-id");
    });
  });

  describe("update", () => {
    it("should throw NotFoundException when updating non-existent book", async () => {
      mockBookRepository.findOneBy.mockImplementationOnce(async () => null);

      await expect(bookService.update("non-existent-id", { title: "New Title" })).rejects.toThrow(NotFoundException);
      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });

    it("should throw ConflictException when updating with existing ISBN", async () => {
      const existingBook = { id: "book-id", isbn: "old-isbn" };
      mockBookRepository.findOneBy.mockImplementationOnce(async () => existingBook);
      mockBookRepository.existsBy.mockImplementationOnce(async () => true);

      await expect(bookService.update("book-id", { isbn: "existing-isbn" })).rejects.toThrow(ConflictException);
      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when updating with non-existent authors", async () => {
      const existingBook = { id: "book-id" };
      mockBookRepository.findOneBy.mockImplementationOnce(async () => existingBook);
      mockBookRepository.existsBy.mockImplementationOnce(async () => false);
      mockAuthorService.existsById.mockImplementationOnce(async () => false);

      await expect(bookService.update("book-id", { authorIds: ["author-1"] })).rejects.toThrow(NotFoundException);
      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when updating with non-existent categories", async () => {
      const existingBook = { id: "book-id" };
      mockBookRepository.findOneBy.mockImplementationOnce(async () => existingBook);
      mockBookRepository.existsBy.mockImplementationOnce(async () => false);
      mockAuthorService.existsById.mockImplementationOnce(async () => true);
      mockCategoryService.existsById.mockImplementationOnce(async () => false);

      await expect(bookService.update("book-id", { categoryIds: ["category-1"] })).rejects.toThrow(NotFoundException);
      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when updating with non-existent publishers", async () => {
      const existingBook = { id: "book-id" };
      mockBookRepository.findOneBy.mockImplementationOnce(async () => existingBook);
      mockBookRepository.existsBy.mockImplementationOnce(async () => false);
      mockAuthorService.existsById.mockImplementationOnce(async () => true);
      mockCategoryService.existsById.mockImplementationOnce(async () => true);
      mockPublisherService.existsById.mockImplementationOnce(async () => false);

      await expect(bookService.update("book-id", { publisherIds: ["publisher-1"] })).rejects.toThrow(NotFoundException);
      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });

    it("should update book successfully", async () => {
      const mockAuthors = [{ id: "author-1" }, { id: "author-2" }];
      const mockCategories = [{ id: "category-1" }];
      const mockPublishers = [{ id: "publisher-1" }];

      mockBookRepository.findOneBy.mockImplementationOnce(async () => ({ id: "book-id" }));
      mockBookRepository.update.mockImplementationOnce(async () => ({
        affected: 1,
      }));
      mockAuthorService.findByIds.mockImplementationOnce(async () => mockAuthors);
      mockAuthorService.existsById.mockImplementationOnce(async () => true);
      mockCategoryService.existsById.mockImplementationOnce(async () => true);
      mockCategoryService.findByIds.mockImplementationOnce(async () => mockCategories);
      mockPublisherService.existsById.mockImplementationOnce(async () => true);
      mockPublisherService.findByIds.mockImplementationOnce(async () => mockPublishers);
      mockBookRepository.findOneBy.mockImplementationOnce(async () => ({}) as Book);

      const result = await bookService.update("book-id", {
        title: "New Title",
        description: "New Description",
        isbn: "new-isbn",
        publishedDate: "2024-02-01",
        photoFileName: "new-photo.jpg",
        authorIds: ["author-1", "author-2"],
        categoryIds: ["category-1"],
        publisherIds: ["publisher-1"],
      });

      expect(mockBookRepository.update).toHaveBeenCalledWith("book-id", {
        title: "New Title",
        description: "New Description",
        isbn: "new-isbn",
        publishedDate: new Date("2024-02-01"),
        photoFileName: "new-photo.jpg",
        authors: mockAuthors,
        categories: mockCategories,
        publishers: mockPublishers,
      });
      expect(result).toBe(1);
    });
  });
});
