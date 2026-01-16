import { Body, Controller } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { TypedRoute } from "@nestia/core";
import { CreateCategoryResponse, type CreateCategoryBody } from "./category.dto";

@Controller("/category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @TypedRoute.Post()
  async createCategory(@Body() body: CreateCategoryBody): Promise<CreateCategoryResponse> {
    const createdCategory = await this.categoryService.create(body);

    return {
      message: "Category has been created successfully",
      data: { categoryId: createdCategory.id },
    };
  }
}
