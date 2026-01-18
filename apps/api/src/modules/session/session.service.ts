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
}
