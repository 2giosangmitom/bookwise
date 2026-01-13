import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@/database/entities/user";
import { createUserDTO } from "@bookwise/shared";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: createUserDTO) {
    const existed = await this.userRepository.existsBy({
      email: data.email,
    });

    if (existed) {
      throw new ConflictException("Email already in use");
    }

    const user = this.userRepository.create({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    return this.userRepository.save(user);
  }
}
