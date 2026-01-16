import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "@/database/entities/category";
import { CreateCategoryBody } from "./category.dto";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(data: CreateCategoryBody): Promise<Category> {
    const existed = await this.categoryRepository.existsBy({
      slug: data.slug,
    });

    if (existed) {
      throw new ConflictException("Slug already in use");
    }

    const category = this.categoryRepository.create(data);

    return this.categoryRepository.save(category);
  }
}
