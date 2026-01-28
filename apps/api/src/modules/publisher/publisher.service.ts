import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, ILike, FindOptionsSelect, Not } from "typeorm";
import { Publisher } from "@/database/entities/publisher";
import { type CreatePublisherBody, type UpdatePublisherBody } from "./publisher.dto";

@Injectable()
export class PublisherService {
  constructor(
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
  ) {}

  async create(data: CreatePublisherBody) {
    // Check conflict slug
    const existed = await this.publisherRepository.existsBy({ slug: data.slug });
    if (existed) throw new ConflictException("Slug already exists");

    // Insert publisher and return created id
    return this.publisherRepository
      .createQueryBuilder()
      .insert()
      .into(Publisher)
      .values({ name: data.name, description: data.description, website: data.website, slug: data.slug })
      .returning("id")
      .execute();
  }

  async update(id: string, data: UpdatePublisherBody) {
    // Check publisher existence
    const publisher = await this.publisherRepository.existsBy({ id });
    if (!publisher) throw new NotFoundException("Publisher not found");

    // Check conflict slug
    if (data.slug) {
      const existed = await this.publisherRepository.existsBy({ slug: data.slug, id: Not(id) });
      if (existed) throw new ConflictException("Slug already exists");
    }

    // Update publisher
    await this.publisherRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    // Check publisher existence
    const publisher = await this.publisherRepository.existsBy({ id });
    if (!publisher) throw new NotFoundException("Publisher not found");

    // Delete publisher
    await this.publisherRepository.delete(id);
  }

  async checkExistence(...ids: string[]) {
    return this.publisherRepository.existsBy({ id: In(ids) });
  }

  async findById(id: string): Promise<Publisher | null> {
    return this.publisherRepository.findOne({
      where: { id },
    });
  }

  async search(options: { page?: number; limit?: number; search?: string }, select?: FindOptionsSelect<Publisher>) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const search = options.search ? ILike(`%${options.search}%`) : undefined;

    return this.publisherRepository.findAndCount({
      select,
      where: [{ name: search }, { slug: search }, { description: search }],
      take: limit,
      skip: (page - 1) * limit,
    });
  }
}
