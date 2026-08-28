import crypto from 'crypto';

const MASTER_KEY_HEX = process.env.ENCRYPTION_MASTER_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypts sensitive student data using AES-256-GCM authenticated encryption.
 */
export function encryptField(plainText: string, keyHex: string = MASTER_KEY_HEX): string {
  if (!plainText) return '';
  const key = Buffer.from(keyHex.slice(0, 64), 'hex');
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
export function decryptField(encryptedJsonString: string, keyHex: string = MASTER_KEY_HEX): string {
  if (!encryptedJsonString) return '';
  try {
    const payload: EncryptedPayload = JSON.parse(encryptedJsonString);
    const key = Buffer.from(keyHex.slice(0, 64), 'hex');
    const iv = Buffer.from(payload.iv, 'hex');
    const authTag = Buffer.from(payload.authTag, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return '[Decryption Error: Authentication Tag / Secret Mismatch]';
  }
}
