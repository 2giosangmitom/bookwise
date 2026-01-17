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
    update: jest.fn(),
    delete: jest.fn(),
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
      expect(mockPublisherRepository.delete).not.toHaveBeenCalled();
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

      await publisherService.delete("publisher-id");

      expect(mockPublisherRepository.findOneBy).toHaveBeenCalledWith({ id: "publisher-id" });
      expect(mockPublisherRepository.delete).toHaveBeenCalledWith("publisher-id");
    });
  });

  describe("update", () => {
    it("should throw NotFoundException when updating non-existent publisher", async () => {
      mockPublisherRepository.findOneBy.mockImplementationOnce(async () => null);

      await expect(publisherService.update("non-existent-id", { name: "New Name" })).rejects.toThrow(NotFoundException);
      expect(mockPublisherRepository.update).not.toHaveBeenCalled();
    });

    it("should throw ConflictException when updating with existing slug", async () => {
      const existingPublisher = { id: "publisher-id", slug: "old-slug" };
      mockPublisherRepository.findOneBy.mockImplementationOnce(async () => existingPublisher);
      mockPublisherRepository.existsBy.mockImplementationOnce(async () => true);

      await expect(publisherService.update("publisher-id", { slug: "existing-slug" })).rejects.toThrow(
        ConflictException,
      );
      expect(mockPublisherRepository.update).not.toHaveBeenCalled();
    });

    it("should update publisher successfully", async () => {
      const existingPublisher = {
        id: "publisher-id",
        name: "Old Name",
        description: "Old Description",
        website: "https://old-website.com",
        slug: "old-slug",
      };

      mockPublisherRepository.findOneBy.mockImplementationOnce(async () => existingPublisher);
      mockPublisherRepository.update.mockImplementationOnce(async () => ({
        affected: 1,
      }));

      await publisherService.update("publisher-id", {
        name: "New Name",
        description: "New Description",
        website: "https://new-website.com",
        slug: "new-slug",
      });

      expect(mockPublisherRepository.update).toHaveBeenCalledWith("publisher-id", {
        name: "New Name",
        description: "New Description",
        website: "https://new-website.com",
        slug: "new-slug",
      });
    });
  });
});
