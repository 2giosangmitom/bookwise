import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { AccountService } from "./account.service";
import { signUpResponseSchema, signUpSchema, type signUpDTO } from "@bookwise/shared";
import { ZodValidationPipe } from "@/pipes/zod";
import { SignUpResponse } from "@bookwise/shared";
import { ApiBody, ApiCreatedResponse } from "@nestjs/swagger";
import { SchemaObject } from "@/types";
import z from "zod";

@Controller("/account")
export class AccountController {
  constructor(private accountServive: AccountService) {}

  @Post("/signup")
  @UsePipes(new ZodValidationPipe(signUpSchema))
  @ApiBody({
    schema: z.toJSONSchema(signUpSchema) as SchemaObject,
  })
  @ApiCreatedResponse({
    schema: z.toJSONSchema(signUpResponseSchema) as SchemaObject,
    description: "Account has been created successfully",
  })
  async signUp(@Body() body: signUpDTO): Promise<SignUpResponse> {
    const createdAccount = await this.accountServive.signUp(body);

    return {
      message: "Account has been created successfully",
      data: { userId: createdAccount.user.id },
    };
  }
}
