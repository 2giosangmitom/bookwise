import { Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service.js";
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "@/database/entities/accounts.js";
import { Repository } from "typeorm";
import { signUpDTO } from "@bookwise/shared/schemas/account";
import { generateHash } from "@/utils/hashing.js";

@Injectable()
export class AccountService {
  constructor(
    private userService: UserService,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
  ) {}

  async signUp(data: signUpDTO) {
    const createdUser = await this.userService.create(data);

    const { hash, salt } = await generateHash(data.password);

    const accountEntity = this.accountRepository.create({
      user: createdUser,
      passwordHash: hash,
      passwordSalt: salt,
    });
    const account = await this.accountRepository.save(accountEntity);

    return account;
  }
}
