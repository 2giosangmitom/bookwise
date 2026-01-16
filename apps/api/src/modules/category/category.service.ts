import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
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

  async delete(id: string): Promise<void> {
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    await this.categoryRepository.delete(id);
  }
}
