import { Controller } from "@nestjs/common";
import { AccountService } from "./account.service";
import { TypedRoute, TypedBody } from "@nestia/core";
import { SignUpResponse, type SignUpBody } from "./account.dto";
import { ApiTags } from "@nestjs/swagger";

@Controller("/account")
@ApiTags("Account")
export class AccountController {
  constructor(private accountServive: AccountService) {}

  @TypedRoute.Post("/signup")
  async signUp(@TypedBody() body: SignUpBody): Promise<SignUpResponse> {
    const createdAccount = await this.accountServive.signUp(body);

    return {
      message: "Account has been created successfully",
      data: { userId: createdAccount.user.id },
    };
  }
}
