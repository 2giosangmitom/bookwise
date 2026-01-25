import { Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "@/database/entities/account";
import { Repository } from "typeorm";
import { HashingUtils } from "@/utils/hashing";
import { SignInBody, SignUpBody } from "./auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    private hashingUtils: HashingUtils,
  ) {}

  async signUp(data: SignUpBody) {
    const createdUser = await this.userService.create(data);

    const { hash, salt } = await this.hashingUtils.generateHash(data.password);

    const accountEntity = this.accountRepository.create({
      user: createdUser,
      passwordHash: hash,
      passwordSalt: salt,
    });
    return this.accountRepository.save(accountEntity);
  }

  async checkCredentials(data: SignInBody) {
    const existUser = await this.accountRepository.findOne({
      where: {
        user: {
          email: data.email,
        },
      },
      relations: ["user"],
    });

    if (!existUser) {
      return null;
    }

    // Check password
    const { hash } = await this.hashingUtils.generateHash(data.password, existUser.passwordSalt);

    if (hash !== existUser.passwordHash) {
      return null;
    }

    return existUser;
  }
}
