import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike, FindOptionsSelect, In, Not } from "typeorm";
import { User } from "@/database/entities/user";
import { CreateUserBody, UpdateUserBody } from "./user.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: CreateUserBody) {
    // Check conflict email
    const existed = await this.userRepository.existsBy({ email: data.email });
    if (existed) throw new ConflictException("Email already exists");

    // Create user
    return this.userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({ email: data.email, firstName: data.firstName, lastName: data.lastName })
      .returning("id")
      .execute();
  }

  findById(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  async update(id: string, data: UpdateUserBody) {
    // Check user existence
    const user = await this.userRepository.existsBy({ id });
    if (!user) throw new NotFoundException("User not found");

    // Check conflict email
    if (data.email) {
      const existed = await this.userRepository.existsBy({ email: data.email, id: Not(id) });
      if (existed) throw new ConflictException("Email already exists");
    }

    // Update user
    await this.userRepository.update(id, data);
  }

  async delete(id: string) {
    // Check user existence
    const user = await this.userRepository.existsBy({ id });
    if (!user) throw new NotFoundException("User not found");

    // Delete user
    await this.userRepository.delete(id);
  }

  async search(options: { page?: number; limit?: number; search?: string }, select?: FindOptionsSelect<User>) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const search = options.search ? ILike(`%${options.search}%`) : undefined;

    return this.userRepository.findAndCount({
      select: select,
      where: [{ firstName: search }, { lastName: search }, { email: search }],
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async checkExistence(...ids: string[]) {
    return this.userRepository.existsBy({ id: In(ids) });
  }
}
