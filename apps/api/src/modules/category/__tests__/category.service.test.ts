import { beforeEach, describe, it, jest, expect } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Category } from "@/database/entities/category";
import { CategoryService } from "../category.service";
import { ConflictException, NotFoundException } from "@nestjs/common";

describe("CategoryService", () => {
  let categoryService: CategoryService;
  const mockCategoryRepository = {
    existsBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
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

  describe("delete", () => {
    it("should throw NotFoundException when category does not exist", async () => {
      mockCategoryRepository.findOneBy.mockImplementationOnce(async () => null);

      await expect(categoryService.delete("non-existent-id")).rejects.toThrow(NotFoundException);
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({
        id: "non-existent-id",
      });
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
    });

    it("should check category existence using findOneBy with correct filter", async () => {
      mockCategoryRepository.findOneBy.mockImplementationOnce(async () => ({
        id: "test-id",
        name: "Test Category",
        slug: "test-category",
      }));

      await categoryService.delete("test-id");

      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({
        id: "test-id",
      });
    });

    it("should delete the category when it exists", async () => {
      const existingCategory = {
        id: "test-id",
        name: "Test Category",
        slug: "test-category",
      };

      mockCategoryRepository.findOneBy.mockImplementationOnce(async () => existingCategory);

      await categoryService.delete("test-id");

      expect(mockCategoryRepository.delete).toHaveBeenCalledWith("test-id");
      expect(mockCategoryRepository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
