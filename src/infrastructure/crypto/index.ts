import { createHash, randomBytes, randomInt, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import type { PasswordHasher, TokenService } from '@/domain/auth/ports';
import type { RandomSource } from '@/domain/generator/ports';
import type { Clock } from '@/domain/shared/Clock';

/**
 * CSPRNG-backed uniform integers. crypto.randomInt does rejection sampling
 * internally, so there is no modulo bias (unlike Math.floor(Math.random()*n)).
 */
export class CryptoRandomSource implements RandomSource {
  nextInt(maxExclusive: number): number {
    return randomInt(maxExclusive);
  }
}

export const systemClock: Clock = { now: () => new Date() };

// Node's default cost (N = 2^14). OWASP suggests 2^17 for production, which
// needs `maxmem` raised above Node's 32 MB default. See README limitations.
const SCRYPT_PARAMS = { N: 2 ** 14, r: 8, p: 1 };
const KEY_LENGTH = 64;

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, KEY_LENGTH, SCRYPT_PARAMS, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}

/** Format: `scrypt$<salt b64>$<key b64>`. The prefix leaves room to migrate algorithms later. */
export class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const key = await scryptAsync(password, salt);
    return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
  }

  async verify(password: string, stored: string): Promise<boolean> {
    const [algorithm, salt, key] = stored.split('$');
    if (algorithm !== 'scrypt' || !salt || !key) return false;
    const expected = Buffer.from(key, 'base64');
    const actual = await scryptAsync(password, Buffer.from(salt, 'base64'));
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }
}

export class CryptoTokenService implements TokenService {
  generate(): string {
    return randomBytes(32).toString('base64url');
  }

  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  newId(): string {
    return randomUUID();
  }
}
