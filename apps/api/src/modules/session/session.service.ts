import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { Session } from "@/database/entities/session";
import { User } from "@/database/entities/user";

@Injectable()
export class SessionService {
  constructor(@InjectRepository(Session) private sessionRepository: Repository<Session>) {}

  create(data: {
    refreshTokenHash: string;
    userAgent: string;
    deviceName: string;
    os?: string;
    browser?: string;
    ipAddress: string;
    expiresAt: Date;
    user: User;
  }) {
    const session = this.sessionRepository.create(data);

    return this.sessionRepository.save(session);
  }

  delete(refreshTokenHash: string) {
    return this.sessionRepository.delete({ refreshTokenHash });
  }

  async revoke(refreshTokenHash: string) {
    await this.sessionRepository.update({ refreshTokenHash }, { revoked: true });
    return this.findOne(refreshTokenHash);
  }

  findOne(refreshTokenHash: string) {
    return this.sessionRepository.findOne({ where: { refreshTokenHash } });
  }

  findById(id: string) {
    return this.sessionRepository.findOne({ where: { id } });
  }

  async revokeById(id: string) {
    await this.sessionRepository.update({ id }, { revoked: true });
    return this.findById(id);
  }

  async findByUserId(userId: string) {
    return this.sessionRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: "DESC" },
    });
  }
}
