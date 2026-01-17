import { Controller, HttpCode, NotFoundException } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { TypedBody, TypedParam, TypedRoute } from "@nestia/core";
import {
  CreateCategoryResponse,
  GetCategoryResponse,
  type CreateCategoryBody,
  type UpdateCategoryBody,
} from "./category.dto";
import { ApiTags } from "@nestjs/swagger";
import { tags } from "typia";

@Controller("/category")
@ApiTags("Category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @TypedRoute.Post()
  async createCategory(@TypedBody() body: CreateCategoryBody): Promise<CreateCategoryResponse> {
    const createdCategory = await this.categoryService.create(body);

    return {
      message: "Category has been created successfully",
      data: { categoryId: createdCategory.id },
    };
  }

  @TypedRoute.Get("/:id")
  async getCategory(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<GetCategoryResponse> {
    const category = await this.categoryService.findById(id);

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      books: category.books.map((book) => ({
        id: book.id,
        title: book.title,
        isbn: book.isbn,
      })),
    };
  }

  @TypedRoute.Patch(":id")
  @HttpCode(204)
  async updateCategory(
    @TypedParam("id") id: string & tags.Format<"uuid">,
    @TypedBody() body: UpdateCategoryBody,
  ): Promise<void> {
    await this.categoryService.update(id, body);
  }

  @TypedRoute.Delete(":id")
  @HttpCode(204)
  async deleteCategory(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<void> {
    await this.categoryService.delete(id);
  }
}
