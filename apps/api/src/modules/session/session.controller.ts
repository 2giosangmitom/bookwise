import { Controller, Req } from "@nestjs/common";
import { TypedRoute } from "@nestia/core";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "@/guards/auth";
import { SessionService } from "./session.service";
import { type FastifyRequest } from "fastify";
import { User } from "@/database/entities/user";
import type { GetSessionsResponse } from "./session.dto";

@Controller("/session")
@ApiTags("Session")
@Auth()
export class SessionController {
  constructor(private sessionService: SessionService) {}

  @TypedRoute.Get("/")
  async getAllSessions(@Req() request: FastifyRequest): Promise<GetSessionsResponse> {
    const user = request.getDecorator("user") as User;
    const sessions = await this.sessionService.findByUserId(user.id);

    return {
      message: "Sessions fetched successfully",
      data: {
        sessions: sessions.map((session) => ({
          id: session.id,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          revoked: session.revoked,
          expiresAt: session.expiresAt.toISOString(),
          createdAt: session.createdAt.toISOString(),
        })),
      },
    };
  }
}
