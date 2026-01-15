import { beforeEach, describe, it, jest, expect } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Publisher } from "@/database/entities/publisher";
import { PublisherService } from "../publisher.service";
import { ConflictException, NotFoundException } from "@nestjs/common";

describe("PublisherService", () => {
  let publisherService: PublisherService;
  const mockPublisherRepository = {
    existsBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PublisherService,
        {
          provide: getRepositoryToken(Publisher),
          useValue: mockPublisherRepository,
        },
      ],
    }).compile();

    publisherService = moduleRef.get(PublisherService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should throw conflict error when slug is already in use", async () => {
      mockPublisherRepository.existsBy.mockImplementationOnce(async () => true);

      await expect(
        publisherService.create({
          name: "Publisher Name",
          description: "Publisher Description",
          website: "https://publisher.com",
          slug: "publisher-slug",
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockPublisherRepository.save).not.toHaveBeenCalled();
    });

    it("should check slug existence using existsBy with correct filter", async () => {
      mockPublisherRepository.existsBy.mockImplementationOnce(async () => false);

      await publisherService.create({
        name: "Publisher Name",
        description: "Publisher Description",
        website: "https://publisher.com",
        slug: "publisher-slug",
      });

      expect(mockPublisherRepository.existsBy).toHaveBeenCalledWith({
        slug: "publisher-slug",
      });
    });

    it("should save the publisher to database if slug is available", async () => {
      mockPublisherRepository.existsBy.mockImplementationOnce(async () => false);

      const dto = {
        name: "Publisher Name",
        description: "Publisher Description",
        website: "https://publisher.com",
        slug: "publisher-slug",
      };

      mockPublisherRepository.create.mockReturnValueOnce(dto);

      await publisherService.create(dto);

      expect(mockPublisherRepository.create).toHaveBeenCalledWith({
        name: "Publisher Name",
        description: "Publisher Description",
        website: "https://publisher.com",
        slug: "publisher-slug",
      });
      expect(mockPublisherRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("delete", () => {
    it("should throw NotFoundException when deleting non-existent publisher", async () => {
      mockPublisherRepository.findOneBy.mockImplementationOnce(async () => null);

      await expect(publisherService.delete("non-existent-id")).rejects.toThrow(NotFoundException);
      expect(mockPublisherRepository.remove).not.toHaveBeenCalled();
    });

    it("should delete publisher successfully when found", async () => {
      const mockPublisher = {
        id: "publisher-id",
        name: "Test Publisher",
        description: "Test Description",
        website: "https://test.com",
        slug: "test-publisher",
        photoFileName: null,
      };

      mockPublisherRepository.findOneBy.mockImplementationOnce(async () => mockPublisher);
      mockPublisherRepository.remove.mockImplementationOnce(async () => mockPublisher);

      const result = await publisherService.delete("publisher-id");

      expect(mockPublisherRepository.findOneBy).toHaveBeenCalledWith({ id: "publisher-id" });
      expect(mockPublisherRepository.remove).toHaveBeenCalledWith(mockPublisher);
      expect(result).toBe(mockPublisher);
    });
  });
});
