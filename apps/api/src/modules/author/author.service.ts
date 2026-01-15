import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Author } from "@/database/entities/author";
import { type createAuthorDTO } from "@bookwise/shared";

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async create(data: createAuthorDTO): Promise<Author> {
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
}
