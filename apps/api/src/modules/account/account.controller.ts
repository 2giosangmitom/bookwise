import { Body, Controller, Post, Response, UsePipes } from "@nestjs/common";
import { AccountService } from "./account.service";
import { signUpResponseSchema, signUpSchema, type signUpDTO } from "@bookwise/shared";
import { ZodValidationPipe } from "@/pipes/zod";
import { SignUpResponse } from "@bookwise/shared";
import { ApiBody, ApiCreatedResponse } from "@nestjs/swagger";
import { SchemaObject } from "@/types";
import z from "zod";
import { type FastifyReply } from "fastify";

@Controller("/account")
export class AccountController {
  constructor(private accountServive: AccountService) {}

  @Post("/signup")
  @UsePipes(new ZodValidationPipe(signUpSchema))
  @ApiBody({
    schema: z.toJSONSchema(signUpSchema) as SchemaObject,
  })
  @ApiCreatedResponse({ schema: z.toJSONSchema(signUpResponseSchema) as SchemaObject })
  async signUp(@Body() body: signUpDTO, @Response() res: FastifyReply): Promise<SignUpResponse> {
    const createdAccount = await this.accountServive.signUp(body);

    res.code(201);
    return {
      message: "Account created successfully",
      data: { userId: createdAccount.user.id },
    };
  }
}
