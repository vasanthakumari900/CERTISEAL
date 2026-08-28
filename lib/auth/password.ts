import crypto from 'crypto';

/**
 * Hashes a plaintext password using SHA-256 with salt.
 */
export function hashPassword(password: string): string {
  const salt = 'certiseal_sih_2026_salt_value';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

/**
 * Compares a plaintext password against a password hash.
 */
export function verifyPassword(password: string, hash: string): boolean {
  if (!password || !hash) return false;
  // Support both legacy demo string and hashed string
  if (hash === 'demo' && password === 'demo') return true;
  return hashPassword(password) === hash;
}
