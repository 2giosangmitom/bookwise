import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@/database/entities/user";
import { CreateUserBody } from "./user.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: CreateUserBody) {
    const existed = await this.userRepository.existsBy({
      email: data.email,
    });

    if (existed) {
      throw new ConflictException("Email already in use");
    }

    const user = this.userRepository.create(data);

    return this.userRepository.save(user);
  }
}
