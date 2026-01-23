import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Author } from "@/database/entities/author";
import { CreateAuthorBody, UpdateAuthorBody } from "./author.dto";

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async create(data: CreateAuthorBody): Promise<Author> {
    const existed = await this.authorRepository.existsBy({
      slug: data.slug,
    });

    if (existed) {
      throw new ConflictException("Slug already in use");
    }

    const author = this.authorRepository.create({
      name: data.name,
      biography: data.biography,
      dateOfBirth: new Date(data.dateOfBirth),
      dateOfDeath: data.dateOfDeath ? new Date(data.dateOfDeath) : null,
      slug: data.slug,
    });

    return this.authorRepository.save(author);
  }

  async update(id: string, data: UpdateAuthorBody): Promise<number> {
    const author = await this.authorRepository.findOneBy({ id });

    if (!author) {
      throw new NotFoundException("Author not found");
    }

    if (data.slug && data.slug !== author.slug) {
      const existed = await this.authorRepository.existsBy({
        slug: data.slug,
      });

      if (existed) {
        throw new ConflictException("Slug already in use");
      }
    }

    const updateData: Partial<Author> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.biography !== undefined) {
      updateData.biography = data.biography;
    }
    if (data.dateOfBirth !== undefined) {
      updateData.dateOfBirth = new Date(data.dateOfBirth);
    }
    if (data.dateOfDeath !== undefined) {
      updateData.dateOfDeath = data.dateOfDeath ? new Date(data.dateOfDeath) : null;
    }
    if (data.slug !== undefined) {
      updateData.slug = data.slug;
    }

    const updateResult = await this.authorRepository.update(id, updateData);

    return updateResult.affected!;
  }

  async delete(id: string): Promise<void> {
    const author = await this.authorRepository.findOneBy({ id });

    if (!author) {
      throw new NotFoundException("Author not found");
    }

    await this.authorRepository.delete(id);
  }

  async existsById(...ids: string[]): Promise<boolean> {
    return this.authorRepository.existsBy({
      id: In(ids),
    });
  }

  async findByIds(ids: string[], select?: (keyof Author)[]): Promise<Author[]> {
    return this.authorRepository.find({
      select: select ? Object.fromEntries(select.map((key) => [key, true])) : undefined,
      where: {
        id: In(ids),
      },
    });
  }

  async findById(id: string): Promise<Author | null> {
    return this.authorRepository.findOne({
      where: { id },
      relations: ["books"],
    });
  }
}
