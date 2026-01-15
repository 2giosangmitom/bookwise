import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { type createCategoryDTO, createCategorySchema, type CreateCategoryResponse } from "@bookwise/shared";
import { ZodValidationPipe } from "@/pipes/zod";
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse } from "@nestjs/swagger";
import {
  ApiErrorResponseJsonSchema,
  CreateCategoryBodyJsonSchema,
  CreateCategoryResponseJsonSchema,
} from "@/constants";

@Controller("/category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createCategorySchema))
  @ApiBody({ schema: CreateCategoryBodyJsonSchema })
  @ApiCreatedResponse({
    schema: CreateCategoryResponseJsonSchema,
    description: "Category has been created successfully",
  })
  @ApiConflictResponse({ schema: ApiErrorResponseJsonSchema, description: "Slug already in use" })
  @ApiBadRequestResponse({ schema: ApiErrorResponseJsonSchema, description: "Validation failed" })
  async createCategory(@Body() body: createCategoryDTO): Promise<CreateCategoryResponse> {
    const createdCategory = await this.categoryService.create(body);

    return {
      message: "Category has been created successfully",
      data: { categoryId: createdCategory.id },
    };
  }
}
