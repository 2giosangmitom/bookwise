import { Injectable } from "@nestjs/common";
import crypto from "node:crypto";
import util from "node:util";

@Injectable()
export class HashingUtils {
  static pbkdf2 = util.promisify(crypto.pbkdf2);

  async generateHash(str: string, salt?: string) {
    if (!salt) {
      salt = crypto.randomBytes(16).toString("hex");
    }

    const hash = await HashingUtils.pbkdf2(str, salt, 1000, 64, "sha256");

    return { hash: hash.toString("hex"), salt };
  }
}
