import { Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "@/database/entities/account";
import { Repository } from "typeorm";
import { signUpDTO } from "@bookwise/shared";
import { HashingUtils } from "@/utils/hashing";

@Injectable()
export class AccountService {
  constructor(
    private userService: UserService,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    private hashingUtils: HashingUtils,
  ) {}

  async signUp(data: signUpDTO) {
    const createdUser = await this.userService.create(data);

    const { hash, salt } = await this.hashingUtils.generateHash(data.password);

    const accountEntity = this.accountRepository.create({
      user: createdUser,
      passwordHash: hash,
      passwordSalt: salt,
    });
    const account = await this.accountRepository.save(accountEntity);

    return account;
  }
}
