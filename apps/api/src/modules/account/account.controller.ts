import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { AccountService } from "./account.service";
import { signUpSchema, type signUpDTO } from "@bookwise/shared";
import { ZodValidationPipe } from "@/pipes/zod";
import { SignUpResponse } from "@bookwise/shared";
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse } from "@nestjs/swagger";
import { ApiErrorResponseJsonSchema, SignUpBodyJsonSchema, SignUpResponseJsonSchema } from "@/constants";

@Controller("/account")
export class AccountController {
  constructor(private accountServive: AccountService) {}

  @Post("/signup")
  @UsePipes(new ZodValidationPipe(signUpSchema))
  @ApiBody({ schema: SignUpBodyJsonSchema })
  @ApiCreatedResponse({
    schema: SignUpResponseJsonSchema,
    description: "Account has been created successfully",
  })
  @ApiConflictResponse({ schema: ApiErrorResponseJsonSchema, description: "Email already in use" })
  @ApiBadRequestResponse({ schema: ApiErrorResponseJsonSchema, description: "Validation failed" })
  async signUp(@Body() body: signUpDTO): Promise<SignUpResponse> {
    const createdAccount = await this.accountServive.signUp(body);

    return {
      message: "Account has been created successfully",
      data: { userId: createdAccount.user.id },
    };
  }
}
