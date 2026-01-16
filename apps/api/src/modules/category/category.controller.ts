import { Controller } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { TypedBody, TypedRoute } from "@nestia/core";
import { CreateCategoryResponse, type CreateCategoryBody } from "./category.dto";
import { ApiTags } from "@nestjs/swagger";

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
}
