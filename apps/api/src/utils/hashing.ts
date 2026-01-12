import crypto from "node:crypto";
import util from "node:util";

const pbkdf2 = util.promisify(crypto.pbkdf2);

export async function generateHash(str: string, salt?: string) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString("hex");
  }

  const hash = await pbkdf2(str, salt, 1000, 64, "sha256");

  return { hash: hash.toString("hex"), salt };
}
