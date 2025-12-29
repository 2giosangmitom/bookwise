import { generateHash, verifyHash } from '@/utils/hash';

describe('hash utilities', () => {
  it('verifies numeric-only input', async () => {
    const input = '1234567890';
    const { hash, salt } = await generateHash(input);
    expect(hash).toBeDefined();
    await expect(verifyHash(input, hash, salt)).resolves.toBe(true);
  });

  it('verifies alphabetic-only input', async () => {
    const input = 'abcdefghijklmnopqrstuvwxyz';
    const { hash, salt } = await generateHash(input);
    await expect(verifyHash(input, hash, salt)).resolves.toBe(true);
  });

  it('verifies alphanumeric input', async () => {
    const input = 'abc123XYZ';
    const { hash, salt } = await generateHash(input);
    await expect(verifyHash(input, hash, salt)).resolves.toBe(true);
  });

  it('verifies empty string input', async () => {
    const input = '';
    const { hash, salt } = await generateHash(input);
    await expect(verifyHash(input, hash, salt)).resolves.toBe(true);
  });

  it('produces different salts and hashes for the same input on successive calls, but both verify', async () => {
    const input = 'repeated-input';
    const a = await generateHash(input);
    const b = await generateHash(input);

    expect(a.salt).toBeDefined();
    expect(b.salt).toBeDefined();
    // salts and hashes should differ due to randomness
    expect(a.salt).not.toEqual(b.salt);
    expect(a.hash).not.toEqual(b.hash);

    // each pair should validate its original input
    await expect(verifyHash(input, a.hash, a.salt)).resolves.toBe(true);
    await expect(verifyHash(input, b.hash, b.salt)).resolves.toBe(true);
  });

  it('fails verification when input is not the same', async () => {
    const original = 'super-secret';
    const { hash, salt } = await generateHash(original);

    // wrong input
    await expect(verifyHash('not-the-secret', hash, salt)).resolves.toBe(false);
  });

  it('fails verification when hash is tampered with', async () => {
    const input = 'integrity-check';
    const { hash, salt } = await generateHash(input);

    // tampered hash
    const tamperedHash = hash.slice(0, -1) + (hash.slice(-1) === 'a' ? 'b' : 'a');
    await expect(verifyHash(input, tamperedHash, salt)).resolves.toBe(false);
  });

  it('fails verification when salt is tampered with', async () => {
    const input = 'integrity-check-salt';
    const { hash, salt } = await generateHash(input);

    // tampered salt
    const tamperedSalt = salt.slice(0, -1) + (salt.slice(-1) === 'a' ? 'b' : 'a');
    await expect(verifyHash(input, hash, tamperedSalt)).resolves.toBe(false);
  });
});
