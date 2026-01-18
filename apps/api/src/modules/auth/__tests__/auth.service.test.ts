import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { AuthService } from "../auth.service";
import { UserService } from "@/modules/user/user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Account } from "@/database/entities/account";
import { HashingUtils } from "@/utils/hashing";

describe("AuthService", () => {
  const mockUserService = {
    create: jest.fn(),
  };
  const mockAccountRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockHashingUtils = {
    generateHash: jest.fn(),
  };
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: HashingUtils,
          useValue: mockHashingUtils,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        AuthService,
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepository,
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    jest.clearAllMocks();
  });

  describe("signUp", () => {
    it("should save hashed password before saving to database", async () => {
      mockHashingUtils.generateHash.mockImplementationOnce(() => ({ hash: "mockHash", salt: "mockSalt" }));
      const createdAccount = { id: "account-id" };
      mockAccountRepository.save.mockImplementationOnce(() => createdAccount);

      const result = await authService.signUp({
        email: "test@email.com",
        firstName: "Test",
        password: "ThisIsPassword",
      });

      expect(mockHashingUtils.generateHash).toHaveBeenCalledWith("ThisIsPassword");
      expect(mockAccountRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          passwordHash: "mockHash",
          passwordSalt: "mockSalt",
        }),
      );
      expect(mockAccountRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toBe(createdAccount);
    });

    it("should delegate user creation to UserService with given DTO", async () => {
      mockHashingUtils.generateHash.mockImplementationOnce(() => ({ hash: "mockHash", salt: "mockSalt" }));
      const dto = {
        email: "another@email.com",
        firstName: "Another",
        password: "Password123",
      };

      await authService.signUp(dto);

      expect(mockUserService.create).toHaveBeenCalledWith(dto);
    });
  });
});
