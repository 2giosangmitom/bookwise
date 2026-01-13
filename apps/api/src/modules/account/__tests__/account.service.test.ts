import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { AccountService } from "../account.service";
import { UserService } from "@/modules/user/user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Account } from "@/database/entities/account";
import { HashingUtils } from "@/utils/hashing";

describe("AccountService", () => {
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
  let accountService: AccountService;

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
        AccountService,
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepository,
        },
      ],
    }).compile();

    accountService = moduleRef.get(AccountService);
  });

  describe("signUp", () => {
    it("should save hashed password before save to database", async () => {
      mockHashingUtils.generateHash.mockImplementationOnce(() => ({ hash: "mockHash", salt: "mockSalt" }));

      await accountService.signUp({
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
    });
  });
});
