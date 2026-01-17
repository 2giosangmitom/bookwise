import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Category } from "@/database/entities/category";
import { CreateCategoryBody, UpdateCategoryBody } from "./category.dto";

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

  async update(id: string, data: UpdateCategoryBody): Promise<number> {
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    if (data.slug && data.slug !== category.slug) {
      const existed = await this.categoryRepository.existsBy({
        slug: data.slug,
      });

      if (existed) {
        throw new ConflictException("Slug already in use");
      }
    }

    const updateData: Partial<Category> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.slug !== undefined) {
      updateData.slug = data.slug;
    }

    const updateResult = await this.categoryRepository.update(id, updateData);

    return updateResult.affected!;
  }

  async delete(id: string): Promise<void> {
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    await this.categoryRepository.delete(id);
  }

  async existsById(...ids: string[]): Promise<boolean> {
    return this.categoryRepository.existsBy({
      id: In(ids),
    });
  }
}
