import crypto from 'node:crypto';
import util from 'node:util';

// Promisify pbkdf2 for easier async/await usage
const pbkdf2 = util.promisify(crypto.pbkdf2);

/**
 * Generates a hash for the given password using PBKDF2 with a random salt.
 * @param password The password to hash
 * @returns An object containing the salt and the hash
 */
export async function generateHash(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await pbkdf2(password, salt, 1000, 64, 'sha256');
  return { hash: hash.toString('hex'), salt };
}

/**
 * Verifies a password against a given salt and hash.
 * @param password The password to verify
 * @param salt The salt used to generate the original hash
 * @param hash The original hash to compare against
 * @returns True if the password is valid, false otherwise
 */
export async function verifyHash(password: string, hash: string, salt: string) {
  const hashToVerify = await pbkdf2(password, salt, 1000, 64, 'sha256');
  return hashToVerify.toString('hex') === hash;
}
