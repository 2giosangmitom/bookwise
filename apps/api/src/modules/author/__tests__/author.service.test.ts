import { beforeEach, describe, it, jest, expect } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Author } from "@/database/entities/author";
import { AuthorService } from "../author.service";
import { ConflictException, NotFoundException } from "@nestjs/common";

describe("AuthorService", () => {
  let authorService: AuthorService;
  const mockAuthorRepository = {
    existsBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthorService,
        {
          provide: getRepositoryToken(Author),
          useValue: mockAuthorRepository,
        },
      ],
    }).compile();

    authorService = moduleRef.get(AuthorService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should throw conflict error when slug is already in use", async () => {
      mockAuthorRepository.existsBy.mockImplementationOnce(async () => true);

      await expect(
        authorService.create({
          name: "Author Name",
          biography: "Bio",
          dateOfBirth: "1990-01-01",
          slug: "author-name",
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockAuthorRepository.save).not.toHaveBeenCalled();
    });

    it("should check slug existence using existsBy with correct filter", async () => {
      mockAuthorRepository.existsBy.mockImplementationOnce(async () => false);

      await authorService.create({
        name: "Author Name",
        biography: "Bio",
        dateOfBirth: "1990-01-01",
        slug: "author-name",
      });

      expect(mockAuthorRepository.existsBy).toHaveBeenCalledWith({
        slug: "author-name",
      });
    });

    it("should save the author to database if slug is available", async () => {
      mockAuthorRepository.existsBy.mockImplementationOnce(async () => false);

      const dto = {
        name: "Author Name",
        biography: "Bio",
        dateOfBirth: "1990-01-01",
        slug: "author-name",
      };

      mockAuthorRepository.create.mockReturnValueOnce(dto);

      await authorService.create(dto);

      expect(mockAuthorRepository.create).toHaveBeenCalledWith({
        name: "Author Name",
        biography: "Bio",
        dateOfBirth: "1990-01-01",
        dateOfDeath: null,
        slug: "author-name",
      });
      expect(mockAuthorRepository.save).toHaveBeenCalledTimes(1);
    });

    it("should throw NotFoundException when deleting non-existent author", async () => {
      mockAuthorRepository.findOneBy.mockImplementationOnce(async () => null);

      await expect(authorService.delete("non-existent-id")).rejects.toThrow(NotFoundException);
      expect(mockAuthorRepository.delete).not.toHaveBeenCalled();
    });

    it("should delete author successfully when found", async () => {
      const mockAuthor = {
        id: "author-id",
        name: "Test Author",
        slug: "test-author",
      };

      mockAuthorRepository.findOneBy.mockImplementationOnce(async () => mockAuthor);

      await authorService.delete("author-id");

      expect(mockAuthorRepository.findOneBy).toHaveBeenCalledWith({ id: "author-id" });
      expect(mockAuthorRepository.delete).toHaveBeenCalledWith("author-id");
    });
  });

  describe("update", () => {
    it("should throw NotFoundException when updating non-existent author", async () => {
      mockAuthorRepository.findOneBy.mockImplementationOnce(async () => null);

      await expect(authorService.update("non-existent-id", { name: "New Name" })).rejects.toThrow(NotFoundException);
      expect(mockAuthorRepository.update).not.toHaveBeenCalled();
    });

    it("should throw ConflictException when updating with existing slug", async () => {
      const existingAuthor = { id: "author-id", slug: "old-slug" };
      mockAuthorRepository.findOneBy.mockImplementationOnce(async () => existingAuthor);
      mockAuthorRepository.existsBy.mockImplementationOnce(async () => true);

      await expect(authorService.update("author-id", { slug: "existing-slug" })).rejects.toThrow(ConflictException);
      expect(mockAuthorRepository.update).not.toHaveBeenCalled();
    });

    it("should update author successfully", async () => {
      const existingAuthor = {
        id: "author-id",
        name: "Old Name",
        biography: "Old Bio",
        slug: "old-slug",
      };

      mockAuthorRepository.findOneBy.mockImplementationOnce(async () => existingAuthor);
      mockAuthorRepository.update.mockImplementationOnce(async () => ({
        affected: 1,
      }));

      await authorService.update("author-id", {
        name: "New Name",
        biography: "New Bio",
        slug: "new-slug",
      });

      expect(mockAuthorRepository.update).toHaveBeenCalledWith("author-id", {
        name: "New Name",
        biography: "New Bio",
        slug: "new-slug",
      });
    });
  });

  describe("findById", () => {
    it("should return author with books relation when found", async () => {
      const mockAuthor = {
        id: "author-id",
        name: "Author Name",
        biography: "Bio",
        dateOfBirth: new Date("1990-01-01"),
        dateOfDeath: null,
        slug: "author-name",
        photoFileName: null,
        books: [{ id: "book-1", title: "Book 1", isbn: "978-0123456789" }],
      };

      mockAuthorRepository.findOne.mockImplementationOnce(() => mockAuthor);

      const result = await authorService.findById("author-id");

      expect(mockAuthorRepository.findOne).toHaveBeenCalledWith({
        where: { id: "author-id" },
        relations: ["books"],
      });
      expect(result).toEqual(mockAuthor);
    });

    it("should return null when author not found", async () => {
      mockAuthorRepository.findOne.mockImplementationOnce(() => null);

      const result = await authorService.findById("nonexistent-id");

      expect(mockAuthorRepository.findOne).toHaveBeenCalledWith({
        where: { id: "nonexistent-id" },
        relations: ["books"],
      });
      expect(result).toBeNull();
    });
  });
});
