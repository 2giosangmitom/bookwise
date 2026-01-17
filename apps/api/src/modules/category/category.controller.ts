import { Controller, HttpCode } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { TypedBody, TypedParam, TypedRoute } from "@nestia/core";
import { CreateCategoryResponse, type CreateCategoryBody, type UpdateCategoryBody } from "./category.dto";
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
