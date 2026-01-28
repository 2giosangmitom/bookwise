import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, ILike, FindOptionsSelect, Not } from "typeorm";
import { Category } from "@/database/entities/category";
import { CreateCategoryBody, UpdateCategoryBody } from "./category.dto";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(data: CreateCategoryBody) {
    // Check conflict slug
    const existed = await this.categoryRepository.existsBy({ slug: data.slug });
    if (existed) throw new ConflictException("Slug already exists");

    // Insert category and return created id
    return this.categoryRepository
      .createQueryBuilder()
      .insert()
      .into(Category)
      .values({ name: data.name, slug: data.slug })
      .returning("id")
      .execute();
  }

  async update(id: string, data: UpdateCategoryBody) {
    // Check category existence
    const category = await this.categoryRepository.existsBy({ id });
    if (!category) throw new NotFoundException("Category not found");

    // Check conflict slug
    if (data.slug) {
      const existed = await this.categoryRepository.existsBy({ slug: data.slug, id: Not(id) });
      if (existed) throw new ConflictException("Slug already exists");
    }

    // Update category
    await this.categoryRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    // Check category existence
    const category = await this.categoryRepository.existsBy({ id });
    if (!category) throw new NotFoundException("Category not found");

    // Delete category
    await this.categoryRepository.delete(id);
  }

  async checkExistence(...ids: string[]) {
    return this.categoryRepository.existsBy({ id: In(ids) });
  }

  async findById(id: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { id },
    });
  }

  async search(options: { page?: number; limit?: number; search?: string }, select?: FindOptionsSelect<Category>) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const search = options.search ? ILike(`%${options.search}%`) : undefined;

    return this.categoryRepository.findAndCount({
      select: select,
      where: [{ name: search }, { slug: search }],
      take: limit,
      skip: (page - 1) * limit,
    });
  }
}
