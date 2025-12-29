import type UserService from './services';
import type { GetMeSchema, ChangePasswordSchema } from './schemas';

export default class UserController {
  private userService: UserService;

  public constructor({ userService }: { userService: UserService }) {
    this.userService = userService;
  }

  public async getMe(req: FastifyRequestTypeBox<typeof GetMeSchema>, reply: FastifyReplyTypeBox<typeof GetMeSchema>) {
    const user = req.user as AccessToken;

    const data = await this.userService.getUserById(user.sub);

    return reply.status(200).send({
      message: 'User profile retrieved successfully',
      data: {
        ...data,
        created_at: data.created_at.toISOString(),
        updated_at: data.updated_at.toISOString()
      }
    });
  }

  public async changePassword(
    req: FastifyRequestTypeBox<typeof ChangePasswordSchema>,
    reply: FastifyReplyTypeBox<typeof ChangePasswordSchema>
  ) {
    const user = req.user as AccessToken;
    const { current_password, new_password } = req.body;

    await this.userService.changePassword(user.sub, current_password, new_password);

    return reply.status(200).send({
      message: 'Password changed successfully'
    });
  }
}
