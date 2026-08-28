import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using Bcrypt with cost factor 10.
 * NO SHA-256, NO STATIC SALTS.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) throw new Error('Password string is required for hashing.');
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a Bcrypt password hash.
 * NO DEMO/DEMO BYPASSES.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    return false;
  }
}
