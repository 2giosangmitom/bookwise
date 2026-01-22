import { Controller, Res, UnauthorizedException, HttpCode, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { TypedRoute, TypedBody, TypedException } from "@nestia/core";
import { type SignInBody, SignInResponse, SignUpResponse, type SignUpBody } from "./auth.dto";
import { ApiTags } from "@nestjs/swagger";
import type { FastifyReply, FastifyRequest } from "fastify";
import { createHash, randomBytes } from "node:crypto";
import { JwtService } from "@nestjs/jwt";
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from "@/constants";
import { SessionService } from "../session/session.service";
import { UAParser } from "ua-parser-js";
import { HttpExceptionBody } from "@nestjs/common";
import { RedisService } from "@/utils/redis";

@Controller("/auth")
@ApiTags("Auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private sessionService: SessionService,
    private redisService: RedisService,
  ) {}

  @TypedRoute.Post("/signup")
  @TypedException<HttpExceptionBody>({
    status: 409,
    description: "Account with provided email already exists",
  })
  async signup(@TypedBody() body: SignUpBody): Promise<SignUpResponse> {
    const createdAccount = await this.authService.signUp(body);

    return {
      message: "Account has been created successfully",
      data: { userId: createdAccount.user.id },
    };
  }

  @TypedRoute.Post("/signin")
  @HttpCode(200)
  async signin(
    @TypedBody() body: SignInBody,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<SignInResponse> {
    const result = await this.authService.checkCredentials(body);

    if (!result) {
      throw new UnauthorizedException("Wrong email or password provided");
    }

    const refreshTokenId = randomBytes(32).toString("hex");
    const refreshToken = this.jwtService.sign(
      {},
      {
        jwtid: refreshTokenId,
        subject: result.user.id,
        expiresIn: REFRESH_TOKEN_TTL,
      },
    );

    // Parse ua and create new session
    const refreshTokenHash = createHash("sha256").update(refreshTokenId).digest("hex");
    const ua = UAParser(request.headers["user-agent"] ?? "");
    const deviceName =
      ua.device.vendor && ua.device.model ? `${ua.device.vendor} ${ua.device.model}` : ua.device.type || "Desktop";
    const os = ua.os.name ? `${ua.os.name} ${ua.os.version ?? ""}`.trim() : undefined;
    const browser = ua.browser.name ? `${ua.browser.name} ${ua.browser.version ?? ""}`.trim() : undefined;

    const session = await this.sessionService.create({
      refreshTokenHash,
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"] ?? "unknown",
      deviceName,
      os,
      browser,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL * 1000),
      user: result.user,
    });

    const accessTokenId = randomBytes(32).toString("hex");
    const accessToken = this.jwtService.sign(
      {
        ssid: session.id,
      },
      {
        jwtid: accessTokenId,
        subject: result.user.id,
        expiresIn: ACCESS_TOKEN_TTL,
      },
    );
    // Add access token to blacklist but not blacklist it yet
    await this.redisService.addToBlacklist(accessTokenId, session.id, ACCESS_TOKEN_TTL);

    // Set cookie
    response.setCookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: REFRESH_TOKEN_TTL,
      sameSite: "none",
      secure: true,
      signed: true,
    });
    return { message: "User signed in successfully", data: { accessToken } };
  }

  @TypedRoute.Post("/signout")
  @HttpCode(204)
  async signout(@Req() request: FastifyRequest, @Res({ passthrough: true }) response: FastifyReply): Promise<void> {
    const refreshTokenCookie = request.cookies.refreshToken;
    if (!refreshTokenCookie) {
      throw new UnauthorizedException("Refresh token not found");
    }

    const unsignedRefreshTokenCookie = request.unsignCookie(refreshTokenCookie);
    if (!unsignedRefreshTokenCookie.valid) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    try {
      const jwtPayload = this.jwtService.verify(unsignedRefreshTokenCookie.value);
      const refreshTokenHash = createHash("sha256").update(jwtPayload.jti).digest("hex");

      // Revoke session
      const session = await this.sessionService.revoke(refreshTokenHash);

      // Blacklist all access tokens related to this session
      if (session) await this.redisService.blackListAllAccessTokensForSession(session.id);
    } catch (error) {
      throw new UnauthorizedException(error);
    } finally {
      response.clearCookie("refreshToken", {
        httpOnly: true,
        path: "/",
        maxAge: REFRESH_TOKEN_TTL,
        sameSite: "none",
        secure: true,
        signed: true,
      });
    }
  }

  @TypedRoute.Post("/refresh")
  @HttpCode(200)
  async refresh(@Req() request: FastifyRequest): Promise<SignInResponse> {
    const refreshTokenCookie = request.cookies.refreshToken;
    if (!refreshTokenCookie) {
      throw new UnauthorizedException("Refresh token not found");
    }

    const unsignedRefreshTokenCookie = request.unsignCookie(refreshTokenCookie);
    if (!unsignedRefreshTokenCookie.valid) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    try {
      const jwtPayload = this.jwtService.verify(unsignedRefreshTokenCookie.value);
      const refreshTokenHash = createHash("sha256").update(jwtPayload.jti).digest("hex");

      const session = await this.sessionService.findOne(refreshTokenHash);

      if (!session || session.expiresAt < new Date() || session.revoked) {
        throw new UnauthorizedException("Session expired or revoked");
      }

      const accessTokenId = randomBytes(32).toString("hex");
      const accessToken = this.jwtService.sign(
        {
          ssid: session.id,
        },
        {
          jwtid: accessTokenId,
          subject: jwtPayload.sub,
          expiresIn: ACCESS_TOKEN_TTL,
        },
      );
      // Add access token to blacklist but not blacklist it yet
      await this.redisService.addToBlacklist(accessTokenId, session.id, ACCESS_TOKEN_TTL);

      return {
        message: "Refresh token successfulyy",
        data: {
          accessToken,
        },
      };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
