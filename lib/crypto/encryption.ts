import crypto from 'crypto';

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
}

/**
 * Retrieves the master AES-256-GCM encryption key from environment variables.
 * FAILS FAST if ENCRYPTION_MASTER_KEY is missing or invalid length.
 * NO FALLBACK KEY IS PERMITTED.
 */
function getMasterKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_MASTER_KEY;
  if (!keyHex || keyHex.length < 64) {
    throw new Error(
      'CRITICAL SECURITY ERROR: ENCRYPTION_MASTER_KEY environment variable is missing or invalid. Application must fail fast.'
    );
  }
  return Buffer.from(keyHex.slice(0, 64), 'hex');
}

/**
 * Encrypts sensitive fields or institution private keys using AES-256-GCM authenticated encryption.
 */
export function encryptField(plainText: string): string {
  if (!plainText) return '';
  const key = getMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  const payload: EncryptedPayload = {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag
  };

  return JSON.stringify(payload);
}

/**
 * Decrypts AES-256-GCM encrypted payload string.
 */
export function decryptField(encryptedJsonString: string): string {
  if (!encryptedJsonString) return '';
  try {
    const payload: EncryptedPayload = JSON.parse(encryptedJsonString);
    const key = getMasterKey();
    const iv = Buffer.from(payload.iv, 'hex');
    const authTag = Buffer.from(payload.authTag, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error: any) {
    if (error.message && error.message.includes('CRITICAL SECURITY ERROR')) {
      throw error;
    }
    return '[Decryption Error: Authentication Tag / Secret Mismatch]';
  }
}
