import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, ILike, FindOptionsSelect, Not } from "typeorm";
import { Author } from "@/database/entities/author";
import { CreateAuthorBody, UpdateAuthorBody } from "./author.dto";

@Injectable()
export class AuthorService {
  constructor(@InjectRepository(Author) private readonly authorRepository: Repository<Author>) {}

  async create(data: CreateAuthorBody) {
    // Check conflict slug
    const existed = await this.authorRepository.existsBy({ slug: data.slug });
    if (existed) throw new ConflictException("Slug already exists");

    // Create author
    return this.authorRepository
      .createQueryBuilder()
      .insert()
      .into(Author)
      .values({
        name: data.name,
        biography: data.biography,
        dateOfBirth: data.dateOfBirth,
        dateOfDeath: data.dateOfDeath,
        slug: data.slug,
      })
      .returning("id")
      .execute();
  }

  async update(id: string, data: UpdateAuthorBody) {
    // Check author existence
    const author = await this.authorRepository.existsBy({ id });
    if (!author) throw new NotFoundException("Author not found");

    // Check conflict slug
    if (data.slug) {
      const existed = await this.authorRepository.existsBy({ slug: data.slug, id: Not(id) });
      if (existed) {
        throw new ConflictException("Slug already exists");
      }
    }

    // Update author
    await this.authorRepository.update(id, data);
  }

  async delete(id: string) {
    // Check author existence
    const author = await this.authorRepository.existsBy({ id });
    if (!author) throw new NotFoundException("Author not found");

    // Delete author
    await this.authorRepository.delete(id);
  }

  async checkExistence(...ids: string[]) {
    return this.authorRepository.existsBy({
      id: In(ids),
    });
  }

  findById(id: string) {
    return this.authorRepository.findOneBy({ id });
  }

  async search(options: { page?: number; limit?: number; search?: string }, select?: FindOptionsSelect<Author>) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const search = options.search ? ILike(`%${options.search}%`) : undefined;

    return this.authorRepository.findAndCount({
      select: select,
      where: [{ name: search }, { slug: search }, { biography: search }],
      take: limit,
      skip: (page - 1) * limit,
    });
  }
}
