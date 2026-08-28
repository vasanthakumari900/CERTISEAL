import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using Bcrypt with cost factor 10.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) throw new Error('Password string is required for hashing.');
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a Bcrypt password hash.
 * Synchronous or async comparison supported. NO DEMO BYPASSES ALLOWED.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    return false;
  }
}

/**
 * Synchronous password verification helper for non-async call sites.
 */
export function verifyPasswordSync(password: string, hash: string): boolean {
  if (!password || !hash) return false;
  try {
    return bcrypt.compareSync(password, hash);
  } catch (error) {
    return false;
  }
}
