import { Controller, Req, Get, Patch, Body, HttpCode } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "@/guards/auth";
import { type FastifyRequest } from "fastify";
import { User } from "@/database/entities/user";
import { UserService } from "./user.service";
import type { GetMeResponse, UpdateUserBody } from "./user.dto";

@Controller("/user")
@ApiTags("User")
@Auth()
export class UserController {
  constructor(private userService: UserService) {}

  @Get("/me")
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

  @Patch("/me")
  @HttpCode(204)
  async updateMe(@Req() request: FastifyRequest, @Body() body: UpdateUserBody): Promise<void> {
    const user = request.getDecorator("user") as User;

    await this.userService.update(user.id, body);
  }
}
