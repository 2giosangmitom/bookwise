import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Publisher } from "@/database/entities/publisher";
import { type CreatePublisherBody, type UpdatePublisherBody } from "./publisher.dto";

@Injectable()
export class PublisherService {
  constructor(
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
  ) {}

  async create(data: CreatePublisherBody): Promise<Publisher> {
    const existed = await this.publisherRepository.existsBy({
      slug: data.slug,
    });

    if (existed) {
      throw new ConflictException("Slug already in use");
    }

    const publisher = this.publisherRepository.create({
      name: data.name,
      description: data.description,
      website: data.website,
      slug: data.slug,
    });

    return this.publisherRepository.save(publisher);
  }

  async update(id: string, data: UpdatePublisherBody): Promise<number> {
    const publisher = await this.publisherRepository.findOneBy({ id });

    if (!publisher) {
      throw new NotFoundException("Publisher not found");
    }

    if (data.slug && data.slug !== publisher.slug) {
      const existed = await this.publisherRepository.existsBy({
        slug: data.slug,
      });

      if (existed) {
        throw new ConflictException("Slug already in use");
      }
    }

    const updateData: Partial<Publisher> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.website !== undefined) {
      updateData.website = data.website;
    }
    if (data.slug !== undefined) {
      updateData.slug = data.slug;
    }

    const updateResult = await this.publisherRepository.update(id, updateData);

    return updateResult.affected!;
  }

  async delete(id: string): Promise<void> {
    const publisher = await this.publisherRepository.findOneBy({ id });

    if (!publisher) {
      throw new NotFoundException("Publisher not found");
    }

    await this.publisherRepository.delete(id);
  }
}
