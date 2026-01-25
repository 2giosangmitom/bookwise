import { Controller, Req, HttpCode, NotFoundException } from "@nestjs/common";
import { TypedRoute, TypedParam } from "@nestia/core";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "@/guards/auth";
import { SessionService } from "./session.service";
import { RedisService } from "@/utils/redis";
import { type FastifyRequest } from "fastify";
import { User } from "@/database/entities/user";
import type { GetSessionsResponse } from "./session.dto";

@Controller("/session")
@ApiTags("Session")
@Auth()
export class SessionController {
  constructor(
    private sessionService: SessionService,
    private redisService: RedisService,
  ) {}

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

  @TypedRoute.Delete("/:id")
  @HttpCode(204)
  async revokeSession(@TypedParam("id") id: string, @Req() request: FastifyRequest): Promise<void> {
    const user = request.getDecorator("user") as User;

    const session = await this.sessionService.findById(id);

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    const ownerId = session.user.id;
    if (ownerId !== user.id) {
      throw new NotFoundException("Session not found");
    }

    await this.sessionService.revokeById(id);
    await this.redisService.blackListAllAccessTokensForSession(id);
  }
}
