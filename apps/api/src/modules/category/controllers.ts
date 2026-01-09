import type CategoryService from './services';
import { GetCategoriesSchema, GetCategoryBySlugSchema } from './schemas';

export default class CategoryController {
  private categoryService: CategoryService;

  public constructor({ categoryService }: { categoryService: CategoryService }) {
    this.categoryService = categoryService;
  }

  public async getCategories(
    req: FastifyRequestTypeBox<typeof GetCategoriesSchema>,
    reply: FastifyReplyTypeBox<typeof GetCategoriesSchema>
  ) {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 50;
    const result = await this.categoryService.getCategories(page, limit);

    return reply.status(200).send({
      message: 'Categories retrieved successfully',
      meta: {
        total: result.total,
        totalOnPage: result.categories.length,
        page,
        limit
      },
      data: result.categories
    });
  }

  public async getCategoryBySlug(
    req: FastifyRequestTypeBox<typeof GetCategoryBySlugSchema>,
    reply: FastifyReplyTypeBox<typeof GetCategoryBySlugSchema>
  ) {
    const category = await this.categoryService.getCategoryBySlug(req.params.slug);

    return reply.status(200).send({
      message: 'Category retrieved successfully',
      data: category
    });
  }
}
