import AdminUserService from './services';
import { GetUsersSchema, UpdateUserSchema } from './schemas';

export default class AdminUserController {
  private adminUserService: AdminUserService;

  public constructor({ adminUserService }: { adminUserService: AdminUserService }) {
    this.adminUserService = adminUserService;
  }

  public async getUsers(
    req: FastifyRequestTypeBox<typeof GetUsersSchema>,
    reply: FastifyReplyTypeBox<typeof GetUsersSchema>
  ) {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 10;
    const { users, total } = await this.adminUserService.getUsers({
      ...req.query,
      page,
      limit
    });

    return reply.status(200).send({
      message: 'Users retrieved successfully',
      meta: {
        total,
        totalOnPage: users.length,
        page,
        limit
      },
      data: users.map((user) => ({
        ...user,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString()
      }))
    });
  }

  public async updateUser(
    req: FastifyRequestTypeBox<typeof UpdateUserSchema>,
    reply: FastifyReplyTypeBox<typeof UpdateUserSchema>
  ) {
    const { userId } = req.params;
    const data = req.body;

    const updatedUser = await this.adminUserService.updateUser(userId, data);

    return reply.status(200).send({
      message: 'User updated successfully',
      data: {
        ...updatedUser,
        created_at: updatedUser.created_at.toISOString(),
        updated_at: updatedUser.updated_at.toISOString()
      }
    });
  }
}
