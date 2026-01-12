import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { AccountService } from "./account.service.js";
import { signUpSchema, type signUpDTO } from "@bookwise/shared/schemas/account";
import { ZodValidationPipe } from "@/pipes/zod.js";
import { SignUpResponse } from "@bookwise/shared/dtos/account";

@Controller("/account")
export class AccountController {
  constructor(private accountServive: AccountService) {}

  @Post("/signup")
  @UsePipes(new ZodValidationPipe(signUpSchema))
  async signUp(@Body() body: signUpDTO): Promise<SignUpResponse> {
    const createdAccount = await this.accountServive.signUp(body);

    return {
      message: "Account created successfully",
      data: { userId: createdAccount.user.id },
    };
  }
}
