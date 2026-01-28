import { Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "@/database/entities/account";
import { Repository } from "typeorm";
import { HashingUtils } from "@/utils/hashing";
import { SignInBody, SignUpBody } from "./auth.dto";
import { User } from "@/database/entities/user";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    private hashingUtils: HashingUtils,
  ) {}

  async signUp(data: SignUpBody) {
    const createdUser = await this.userService.create(data);

    // createdUser is insertion result with returning id
    const user = await this.userService.findById(createdUser.raw[0].id);

    const { hash, salt } = await this.hashingUtils.generateHash(data.password);

    const accountEntity = this.accountRepository.create({
      user: user!,
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

  async changePassword(user: User, newPassword: string) {
    const { hash, salt } = await this.hashingUtils.generateHash(newPassword);

    await this.accountRepository.update(
      {
        user,
      },
      {
        passwordHash: hash,
        passwordSalt: salt,
      },
    );
  }
}
