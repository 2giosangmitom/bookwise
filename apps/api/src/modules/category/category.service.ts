import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, ILike } from "typeorm";
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

  async findByIds(ids: string[], select?: (keyof Category)[]): Promise<Category[]> {
    return this.categoryRepository.find({
      select: select ? Object.fromEntries(select.map((key) => [key, true])) : undefined,
      where: {
        id: In(ids),
      },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ["books"],
    });
  }

  async search(options: { page?: number; limit?: number; search?: string | null }, select?: (keyof Category)[]) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const search = ILike(`%${options.search}%`);

    return this.categoryRepository.findAndCount({
      select: select ? Object.fromEntries(select.map((field) => [field, true])) : undefined,
      where: [{ name: search }, { slug: search }],
      take: limit,
      skip: (page - 1) * limit,
    });
  }
}
