import { describe, it, expect } from "@jest/globals";
import { generateHash } from "../hashing";

describe("utils.hashing", () => {
  describe("generateHash", () => {
    it("should produce same hash when giving the same input and salt", async () => {
      const input = "thisIsAPassword";
      const { hash: hash1, salt: salt1 } = await generateHash(input);
      const { hash: hash2 } = await generateHash(input, salt1);

      expect(hash1).toBe(hash2);
    });
  });
});
