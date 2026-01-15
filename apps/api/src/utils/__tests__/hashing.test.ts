import { describe, it, expect } from "@jest/globals";
import { HashingUtils } from "../hashing";

describe("HashingUtils", () => {
  const hashingUtils = new HashingUtils();

  describe("generateHash", () => {
    it("should produce same hash when giving the same input and salt", async () => {
      const input = "thisIsAPassword";
      const { hash: hash1, salt: salt1 } = await hashingUtils.generateHash(input);
      const { hash: hash2 } = await hashingUtils.generateHash(input, salt1);

      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes when using different salts", async () => {
      const input = "thisIsAPassword";
      const { hash: hash1 } = await hashingUtils.generateHash(input);
      const { hash: hash2 } = await hashingUtils.generateHash(input);

      expect(hash1).not.toBe(hash2);
    });
  });
});
