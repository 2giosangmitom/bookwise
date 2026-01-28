import { Controller, Req, HttpCode } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "@/guards/auth";
import { type FastifyRequest } from "fastify";
import { User } from "@/database/entities/user";
import { UserService } from "./user.service";
import type { GetMeResponse, UpdateUserBody, GetUsersResponse } from "./user.dto";
import { TypedBody, TypedQuery, TypedRoute } from "@nestia/core";
import { tags } from "typia";
import { Role } from "@bookwise/shared";

@Controller("/user")
@ApiTags("User")
@Auth()
export class UserController {
  constructor(private userService: UserService) {}

  @TypedRoute.Get("/me")
  async me(@Req() request: FastifyRequest): Promise<GetMeResponse> {
    const user = request.getDecorator("user") as User;

    return {
      message: "User fetched successfully",
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName ?? null,
        photoFileName: user.photoFileName ?? null,
        role: user.role,
      },
    };
  }

  @TypedRoute.Patch("/me")
  @HttpCode(204)
  async updateMe(@Req() request: FastifyRequest, @TypedBody() body: UpdateUserBody): Promise<void> {
    const user = request.getDecorator("user") as User;

    await this.userService.update(user.id, body);
  }

  @TypedRoute.Get("/")
  @Auth(Role.ADMIN)
  async getAllUsers(
    @TypedQuery()
    query: Partial<{ page: number & tags.Type<"uint32">; limit: number & tags.Type<"uint32">; search: string }>,
  ): Promise<GetUsersResponse> {
    const [users, total] = await this.userService.search(query);

    return {
      message: "Users fetched successfully",
      meta: { total },
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName ?? null,
        photoFileName: u.photoFileName ?? null,
        role: u.role,
      })),
    };
  }
}
