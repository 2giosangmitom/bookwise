import { beforeEach, describe, it, jest, expect } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { LoanService } from "../loan.service";
import { Loan } from "@/database/entities/loan";
import { UserService } from "../../user/user.service";
import { NotFoundException } from "@nestjs/common";
import { BookCopyService } from "@/modules/bookCopy/bookCopy.service";
import { BookCondition, BookStatus } from "@bookwise/shared";
import { DataSource } from "typeorm";

describe("LoanService", () => {
  let loanService: LoanService;

  const mockLoanRepository = {
    create: jest.fn(),
  };

  const mockUserService = {
    findById: jest.fn(),
  };

  const mockBookCopyService = {
    findByIds: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LoanService,
        { provide: getRepositoryToken(Loan), useValue: mockLoanRepository },
        { provide: UserService, useValue: mockUserService },
        { provide: BookCopyService, useValue: mockBookCopyService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    loanService = moduleRef.get(LoanService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should throw NotFoundException when user not found", async () => {
      mockUserService.findById.mockImplementationOnce(async () => null);
      mockBookCopyService.findByIds.mockImplementationOnce(async () => []);

      await expect(
        loanService.create({
          user: "user-1",
          loanDate: new Date().toISOString(),
          dueDate: new Date().toISOString(),
          bookCopies: ["copy-1"],
        }),
      ).rejects.toThrow(NotFoundException);

      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    it("should create loan when user exists", async () => {
      const user = { id: "user-1" };
      mockUserService.findById.mockImplementationOnce(async () => user);
      mockLoanRepository.create.mockReturnValueOnce({ id: "loan-1" });
      mockBookCopyService.findByIds.mockImplementationOnce(() => [
        { id: "copy-1", status: BookStatus.AVAILABLE, condition: BookCondition.GOOD },
        { id: "copy-2", status: BookStatus.AVAILABLE, condition: BookCondition.NEW },
      ]);

      await loanService.create({
        user: user.id,
        loanDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        bookCopies: ["copy-1", "copy-2"],
      });

      expect(mockLoanRepository.create).toHaveBeenCalledWith({
        user,
        loanDate: expect.any(Date),
        dueDate: expect.any(Date),
        bookCopies: [
          { id: "copy-1", status: BookStatus.AVAILABLE, condition: BookCondition.GOOD },
          { id: "copy-2", status: BookStatus.AVAILABLE, condition: BookCondition.NEW },
        ],
      });

      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
    });

    it("should not create loan when one of book copies is not available", () => {
      const user = { id: "user-1" };
      mockUserService.findById.mockImplementationOnce(async () => user);
      mockLoanRepository.create.mockReturnValueOnce({ id: "loan-1" });
      mockBookCopyService.findByIds.mockImplementationOnce(() => [
        { id: "copy-1", status: BookStatus.AVAILABLE, condition: BookCondition.GOOD },
        { id: "copy-2", status: BookStatus.AVAILABLE, condition: BookCondition.WORN },
      ]);

      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });
  });
});
