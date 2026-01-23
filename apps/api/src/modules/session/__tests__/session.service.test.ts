import { beforeEach, describe, it, jest, expect } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { SessionService } from "../session.service";
import { Session } from "@/database/entities/session";

describe("SessionService", () => {
  let sessionService: SessionService;

  const mockSessionRepo = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: getRepositoryToken(Session),
          useValue: mockSessionRepo,
        },
      ],
    }).compile();

    sessionService = moduleRef.get(SessionService);
    jest.clearAllMocks();
  });

  describe("findByUserId", () => {
    it("should return sessions for given user id", async () => {
      const mockSessions = [
        { id: "s1", user: { id: "u1" } },
        { id: "s2", user: { id: "u1" } },
      ];
      mockSessionRepo.find.mockImplementationOnce(async () => mockSessions);

      const result = await sessionService.findByUserId("u1");

      expect(mockSessionRepo.find).toHaveBeenCalledWith({
        where: { user: { id: "u1" } },
        order: { createdAt: "DESC" },
      });
      expect(result).toBe(mockSessions);
    });
  });
});
