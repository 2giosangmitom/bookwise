import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Session } from "@/database/entities/session";
import { User } from "@/database/entities/user";

@Injectable()
export class SessionService {
  constructor(@InjectRepository(Session) private sessionRepository: Repository<Session>) {}

  async create(data: {
    refreshTokenHash: string;
    userAgent: string;
    deviceName: string;
    os?: string;
    browser?: string;
    ipAddress: string;
    expiresAt: Date;
    user: User;
  }) {
    const result = await this.sessionRepository
      .createQueryBuilder()
      .insert()
      .into(Session)
      .values({
        refreshTokenHash: data.refreshTokenHash,
        userAgent: data.userAgent,
        deviceName: data.deviceName,
        os: data.os,
        browser: data.browser,
        ipAddress: data.ipAddress,
        expiresAt: data.expiresAt,
        user: data.user,
      })
      .returning("id")
      .execute();

    return { id: result.raw?.[0]?.id };
  }

  delete(refreshTokenHash: string) {
    return this.sessionRepository.delete({ refreshTokenHash });
  }

  async revokeByHash(refreshTokenHash: string) {
    await this.sessionRepository.update({ refreshTokenHash }, { revoked: true });
    return this.findByRefreshTokenHash(refreshTokenHash);
  }

  findByRefreshTokenHash(refreshTokenHash: string) {
    return this.sessionRepository.findOne({ where: { refreshTokenHash } });
  }

  findById(id: string) {
    return this.sessionRepository.findOne({ where: { id } });
  }

  async revokeBySessionId(id: string) {
    const existed = await this.sessionRepository.existsBy({ id });
    if (!existed) throw new NotFoundException("Session not found");

    await this.sessionRepository.update(id, { revoked: true });
    return this.findById(id);
  }

  async findByUserId(userId: string) {
    return this.sessionRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: "DESC" },
    });
  }

  async checkExistence(...ids: string[]) {
    return this.sessionRepository.existsBy({ id: In(ids) });
  }
}
