import AdminUserService from './services';
import { GetUsersSchema } from './schemas';

export default class AdminUserController {
  private adminUserService: AdminUserService;

  public constructor({ adminUserService }: { adminUserService: AdminUserService }) {
    this.adminUserService = adminUserService;
  }

  public async getUsers(
    req: FastifyRequestTypeBox<typeof GetUsersSchema>,
    reply: FastifyReplyTypeBox<typeof GetUsersSchema>
  ) {
    const { users, total } = await this.adminUserService.getUsers({
      ...req.query,
      page: req.query.page ?? 1,
      limit: req.query.limit ?? 100
    });

    const totalPages = Math.ceil(total / (req.query.limit ?? 100));

    return reply.status(200).send({
      message: 'Users retrieved successfully',
      meta: { totalPages },
      data: users.map((user) => ({
        ...user,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString()
      }))
    });
  }
}
