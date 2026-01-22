import { Injectable, CanActivate, ExecutionContext, Inject, applyDecorators, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { FastifyRequest } from "fastify";
import { RedisService } from "@/utils/redis";
import { Reflector } from "@nestjs/core";
import { Role } from "@bookwise/shared";
import { UserService } from "@/modules/user/user.service";
import { ApiBearerAuth } from "@nestjs/swagger";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(JwtService) private jwtService: JwtService,
    private redisService: RedisService,
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as FastifyRequest;

    const authHeader = request.headers["authorization"];
    if (!authHeader) {
      return false;
    }

    const [, token] = authHeader.split(" ");
    try {
      const payload = await this.jwtService.verifyAsync(token);

      // Check if the token is blacklisted
      const isBlackListed = await this.redisService.isAccessTokenBlackListed(payload.jti, payload.ssid);
      if (isBlackListed) {
        return false;
      }

      // Check role
      const roles = this.reflector.get(Roles, context.getHandler());
      if (roles.length !== 0) {
        const user = await this.userService.findById(payload.sub);
        if (!user) {
          return false;
        }

        if (roles && !roles.includes(user.role)) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }
}

export const Roles = Reflector.createDecorator<Role[]>();

export function Auth(...roles: Role[]) {
  return applyDecorators(UseGuards(AuthGuard), Roles(roles), ApiBearerAuth());
}
