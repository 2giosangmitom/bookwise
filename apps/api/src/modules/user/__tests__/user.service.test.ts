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
  });
});
