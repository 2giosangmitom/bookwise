import { Controller, Res, UnauthorizedException, HttpCode, Req } from "@nestjs/common";
import { AccountService } from "./account.service";
import { TypedRoute, TypedBody } from "@nestia/core";
import { type SignInBody, SignInResponse, SignUpResponse, type SignUpBody } from "./account.dto";
import { ApiTags } from "@nestjs/swagger";
import type { FastifyReply, FastifyRequest } from "fastify";
import { createHash, randomBytes } from "node:crypto";
import { JwtService } from "@nestjs/jwt";
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from "@/constants";
import { SessionService } from "../session/session.service";
import { UAParser } from "ua-parser-js";

@Controller("/account")
@ApiTags("Account")
export class AccountController {
  constructor(
    private accountServive: AccountService,
    private jwtService: JwtService,
    private sessionService: SessionService,
  ) {}

  @TypedRoute.Post("/signup")
  async signUp(@TypedBody() body: SignUpBody): Promise<SignUpResponse> {
    const createdAccount = await this.accountServive.signUp(body);

    return {
      message: "Account has been created successfully",
      data: { userId: createdAccount.user.id },
    };
  }

  @TypedRoute.Post("/signin")
  @HttpCode(200)
  async signIn(
    @TypedBody() body: SignInBody,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<SignInResponse> {
    const result = await this.accountServive.checkCredentials(body);

    if (!result) {
      throw new UnauthorizedException("Wrong email or password provided");
    }

    const refreshTokenId = randomBytes(32).toString("hex");
    const refreshToken = this.jwtService.sign(
      {
        scope: "refreshToken",
      },
      {
        jwtid: refreshTokenId,
        subject: result.user.id,
        expiresIn: REFRESH_TOKEN_TTL,
      },
    );

    const accessToken = this.jwtService.sign(
      {
        scope: "accessToken",
      },
      {
        subject: result.user.id,
        expiresIn: ACCESS_TOKEN_TTL,
      },
    );

    response.setCookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/account/refresh",
      maxAge: REFRESH_TOKEN_TTL,
      sameSite: "none",
      secure: true,
      signed: true,
    });

    // Parse ua and create new session
    const refreshTokenHash = createHash("sha256").update(refreshTokenId).digest("hex");
    const ua = UAParser(request.headers["user-agent"] ?? "");
    const deviceName =
      ua.device.vendor && ua.device.model ? `${ua.device.vendor} ${ua.device.model}` : ua.device.type || "Desktop";
    const os = ua.os.name ? `${ua.os.name} ${ua.os.version ?? ""}`.trim() : undefined;
    const browser = ua.browser.name ? `${ua.browser.name} ${ua.browser.version ?? ""}`.trim() : undefined;

    await this.sessionService.create({
      refreshTokenHash,
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"] ?? "unknown",
      deviceName,
      os,
      browser,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL * 1000),
      user: result.user,
    });

    return { message: "User signed in successfully", data: { accessToken } };
  }
}
