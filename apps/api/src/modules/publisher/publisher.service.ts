import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Publisher } from "@/database/entities/publisher";
import { type createPublisherDTO } from "@bookwise/shared";

@Injectable()
export class PublisherService {
  constructor(
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
  ) {}

  async create(data: createPublisherDTO): Promise<Publisher> {
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
}
