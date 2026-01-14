import { beforeEach, describe, it, jest, expect } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { UserService } from "../user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "@/database/entities/user";
import { ConflictException } from "@nestjs/common";

describe("UserService", () => {
  let userService: UserService;
  const mockUserRepository = {
    existsBy: jest.fn(),
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
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should throw conflict error when email is already in use", async () => {
      mockUserRepository.existsBy.mockImplementationOnce(() => true);

      await expect(
        userService.create({
          email: "test@email.com",
          firstName: "Test",
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it("should check email existence using existsBy with correct filter", async () => {
      await userService.create({
        email: "available@email.com",
        firstName: "Test",
      });

      expect(mockUserRepository.existsBy).toHaveBeenCalledWith({
        email: "available@email.com",
      });
    });

    it("should save the user to database if email is available", async () => {
      mockUserRepository.existsBy.mockImplementationOnce(() => false);

      const dto = {
        email: "test@email.com",
        firstName: "Test",
      };

      await userService.create(dto);

      expect(mockUserRepository.create).toHaveBeenCalledWith(dto);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
