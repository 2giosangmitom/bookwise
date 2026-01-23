import { beforeEach, describe, it, jest, expect } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { LoanService } from "../loan.service";
import { Loan } from "@/database/entities/loan";
import { UserService } from "../../user/user.service";
import { NotFoundException } from "@nestjs/common";

describe("LoanService", () => {
  let loanService: LoanService;

  const mockLoanRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LoanService,
        { provide: getRepositoryToken(Loan), useValue: mockLoanRepository },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    loanService = moduleRef.get(LoanService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should throw NotFoundException when user not found", async () => {
      mockUserService.findById.mockImplementationOnce(async () => null);

      await expect(
        loanService.create({
          user: "user-1",
          loanDate: new Date().toISOString(),
          dueDate: new Date().toISOString(),
          bookCopies: ["copy-1"],
        }),
      ).rejects.toThrow(NotFoundException);

      expect(mockLoanRepository.save).not.toHaveBeenCalled();
    });

    it("should create loan when user exists", async () => {
      const user = { id: "user-1" };
      mockUserService.findById.mockImplementationOnce(async () => user);
      mockLoanRepository.create.mockReturnValueOnce({ id: "loan-1" });

      const dto = {
        user: "user-1",
        loanDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        bookCopies: ["copy-1", "copy-2"],
      };

      await loanService.create(dto);

      expect(mockLoanRepository.create).toHaveBeenCalledWith({
        user,
        loanDate: expect.any(Date),
        dueDate: expect.any(Date),
        bookCopies: [{ id: "copy-1" }, { id: "copy-2" }],
      });
      expect(mockLoanRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
