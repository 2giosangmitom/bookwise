import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { User } from "@/database/entities/user";
import { CreateUserBody, UpdateUserBody } from "./user.dto";

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

  findById(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  update(id: string, data: UpdateUserBody) {
    return this.userRepository.update(
      {
        id,
      },
      {
        firstName: data.firstName,
        lastName: data.lastName,
      },
    );
  }

  async search(options: { page?: number; limit?: number; search?: string }, select?: (keyof User)[]) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const search = ILike(`%${options.search}%`);

    return this.userRepository.findAndCount({
      select: select ? Object.fromEntries(select.map((field) => [field, true])) : undefined,
      where: [{ firstName: search }, { lastName: search }, { email: search }],
      take: limit,
      skip: (page - 1) * limit,
    });
  }
}
