import { Controller, Req } from "@nestjs/common";
import { TypedRoute } from "@nestia/core";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "@/guards/auth";
import { SessionService } from "./session.service";
import { type FastifyRequest } from "fastify";
import { User } from "@/database/entities/user";

@Controller("/session")
@ApiTags("Session")
@Auth()
export class SessionController {
  constructor(private sessionService: SessionService) {}

  @TypedRoute.Get("/")
  async getAllSessions(@Req() request: FastifyRequest) {
    const user = request.getDecorator("user") as User;

    return {
      message: "Sessions fetched successfully",
      data: { sessions: await this.sessionService.findByUserId(user.id) },
    };
  }
}
