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
  };

  const mockAuthorService = {
    existsById: jest.fn(),
  };

  const mockCategoryService = {
    existsById: jest.fn(),
  };

  const mockPublisherService = {
    existsById: jest.fn(),
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
});
