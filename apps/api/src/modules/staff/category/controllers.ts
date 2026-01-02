import type StaffCategoryService from './services';
import { CreateCategorySchema, DeleteCategorySchema, GetCategoriesSchema, UpdateCategorySchema } from './schemas';

export default class StaffCategoryController {
  private categoryService: StaffCategoryService;

  public constructor({ staffCategoryService }: { staffCategoryService: StaffCategoryService }) {
    this.categoryService = staffCategoryService;
  }

  public async createCategory(
    req: FastifyRequestTypeBox<typeof CreateCategorySchema>,
    reply: FastifyReplyTypeBox<typeof CreateCategorySchema>
  ) {
    const { name, slug } = req.body;

    const created = await this.categoryService.createCategory({ name, slug });

    return reply.status(201).send({
      message: 'Category created successfully.',
      data: {
        ...created,
        created_at: created.created_at.toISOString(),
        updated_at: created.updated_at.toISOString()
      }
    });
  }

  public async deleteCategory(
    req: FastifyRequestTypeBox<typeof DeleteCategorySchema>,
    reply: FastifyReplyTypeBox<typeof DeleteCategorySchema>
  ) {
    const { category_id } = req.params;

    const deleted = await this.categoryService.deleteCategory(category_id);

    return reply.status(200).send({ message: 'Category deleted successfully', data: deleted });
  }

  public async updateCategory(
    req: FastifyRequestTypeBox<typeof UpdateCategorySchema>,
    reply: FastifyReplyTypeBox<typeof UpdateCategorySchema>
  ) {
    const { category_id } = req.params;
    const { name, slug } = req.body;

    const updated = await this.categoryService.updateCategory(category_id, { name, slug });

    return reply.status(200).send({
      message: 'Category updated successfully.',
      data: {
        ...updated,
        created_at: updated.created_at.toISOString(),
        updated_at: updated.updated_at.toISOString()
      }
    });
  }

  public async getCategories(
    req: FastifyRequestTypeBox<typeof GetCategoriesSchema>,
    reply: FastifyReplyTypeBox<typeof GetCategoriesSchema>
  ) {
    const query = {
      limit: req.query.limit ?? 10,
      page: req.query.page ?? 1,
      searchTerm: req.query.searchTerm ?? undefined
    };

    const { categories, total } = await this.categoryService.getCategories(query);

    return reply.status(200).send({
      message: 'Categories retrieved successfully.',
      meta: {
        total,
        totalOnPage: categories.length,
        page: query.page,
        limit: query.limit
      },
      data: categories.map((category) => ({
        category_id: category.category_id,
        name: category.name,
        slug: category.slug,
        created_at: category.created_at.toISOString(),
        updated_at: category.updated_at.toISOString()
      }))
    });
  }
}
