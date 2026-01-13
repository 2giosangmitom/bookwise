import { beforeEach, describe, it, jest, expect } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { UserService } from "../user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "@/database/entities/user";
import { ConflictException } from "@nestjs/common";

describe("UserService", () => {
  let userService: UserService;
  const mockUserRepository = {
    existsBy: jest.fn(() => false),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = moduleRef.get(UserService);
  });

  describe("create", () => {
    it("should throw conflict error when email is already in use", async () => {
      // Mock exists method
      mockUserRepository.existsBy.mockImplementationOnce(() => true);

      await expect(
        userService.create({
          email: "test@email.com",
          firstName: "Test",
        }),
      ).rejects.toThrow(ConflictException);
    });

    it("should save the user to database if email is available", async () => {
      await userService.create({
        email: "test@email.com",
        firstName: "Test",
      });

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: "test@email.com",
        firstName: "Test",
      });
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
