import { Controller, Req, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "@/guards/auth";
import { type FastifyRequest } from "fastify";
import { User } from "@/database/entities/user";
import type { GetMeResponse } from "./user.dto";

@Controller("/user")
@ApiTags("User")
@Auth()
export class UserController {
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
}
