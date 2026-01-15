import { beforeEach, describe, it, jest, expect } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Category } from "@/database/entities/category";
import { CategoryService } from "../category.service";
import { ConflictException } from "@nestjs/common";

describe("CategoryService", () => {
  let categoryService: CategoryService;
  const mockCategoryRepository = {
    existsBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    categoryService = moduleRef.get(CategoryService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should throw conflict error when slug is already in use", async () => {
      mockCategoryRepository.existsBy.mockImplementationOnce(async () => true);

      await expect(
        categoryService.create({
          name: "Fiction",
          slug: "fiction",
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });

    it("should check slug existence using existsBy with correct filter", async () => {
      mockCategoryRepository.existsBy.mockImplementationOnce(async () => false);

      await categoryService.create({
        name: "Fiction",
        slug: "fiction",
      });

      expect(mockCategoryRepository.existsBy).toHaveBeenCalledWith({
        slug: "fiction",
      });
    });

    it("should save the category to database if slug is available", async () => {
      mockCategoryRepository.existsBy.mockImplementationOnce(async () => false);

      const dto = {
        name: "Fiction",
        slug: "fiction",
      };

      mockCategoryRepository.create.mockReturnValueOnce(dto);

      await categoryService.create(dto);

      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        name: "Fiction",
        slug: "fiction",
      });
      expect(mockCategoryRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
