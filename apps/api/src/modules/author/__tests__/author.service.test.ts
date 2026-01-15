import { beforeEach, describe, it, jest, expect } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Author } from "@/database/entities/author";
import { AuthorService } from "../author.service";
import { ConflictException } from "@nestjs/common";

describe("AuthorService", () => {
  let authorService: AuthorService;
  const mockAuthorRepository = {
    existsBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
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

      mockAuthorRepository.create.mockImplementation((input) => input);

      await authorService.create(dto);

      expect(mockAuthorRepository.create).toHaveBeenCalledWith({
        name: "Author Name",
        biography: "Bio",
        dateOfBirth: new Date("1990-01-01"),
        dateOfDeath: null,
        slug: "author-name",
      });
      expect(mockAuthorRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
