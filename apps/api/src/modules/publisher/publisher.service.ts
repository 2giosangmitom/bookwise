import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, ILike } from "typeorm";
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

  async existsById(...ids: string[]): Promise<boolean> {
    return this.publisherRepository.existsBy({
      id: In(ids),
    });
  }

  async findByIds(ids: string[], select?: (keyof Publisher)[]): Promise<Publisher[]> {
    return this.publisherRepository.find({
      select: select ? Object.fromEntries(select.map((key) => [key, true])) : undefined,
      where: {
        id: In(ids),
      },
    });
  }

  async findById(id: string): Promise<Publisher | null> {
    return this.publisherRepository.findOne({
      where: { id },
      relations: ["books"],
    });
  }

  async search(options: { page?: number; limit?: number; search?: string }, select?: (keyof Publisher)[]) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const search = options.search ? ILike(`%${options.search}%`) : undefined;

    return this.publisherRepository.findAndCount({
      select: select ? Object.fromEntries(select.map((field) => [field, true])) : undefined,
      where: [{ name: search }, { slug: search }, { description: search }],
      take: limit,
      skip: (page - 1) * limit,
    });
  }
}
