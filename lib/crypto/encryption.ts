import crypto from 'crypto';
import { getKMSProvider } from './kms';

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
}

export interface EnvelopeEncryptedResult {
  encryptedPayload: string;
  encryptedDEK: string;
  iv: string;
  authTag: string;
  kmsKeyId: string;
  encryptionAlgorithm: string;
  encryptionVersion: string;
}

/**
 * Retrieves the master AES-256-GCM encryption key from environment variables.
 * FAILS FAST if ENCRYPTION_MASTER_KEY is missing.
 * NO FALLBACK OR DEFAULT KEYS PERMITTED.
 */
function getMasterKey(): Buffer {
  const ENCRYPTION_MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY;
  if (!ENCRYPTION_MASTER_KEY) {
    throw new Error("ENCRYPTION_MASTER_KEY is required");
  }
  return Buffer.from(ENCRYPTION_MASTER_KEY.slice(0, 64), 'hex');
}

/**
 * Encrypts sensitive fields or institution private keys directly using AES-256-GCM.
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
    if (error.message && error.message.includes('ENCRYPTION_MASTER_KEY is required')) {
      throw error;
    }
    return '[Decryption Error: Authentication Tag / Secret Mismatch]';
  }
}

/**
 * Envelope Encryption for Certificates:
 * Generates a unique 256-bit Data Encryption Key (DEK) per certificate, encrypts payload with DEK,
 * and wraps DEK with the KMS provider.
 */
export async function encryptEnvelope(plainText: string): Promise<EnvelopeEncryptedResult> {
  if (!plainText) {
    throw new Error('Plaintext payload is required for envelope encryption');
  }

  // 1. Generate unique random 256-bit DEK
  const dek = crypto.randomBytes(32);

  // 2. Encrypt plaintext payload with DEK using AES-256-GCM
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', dek, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  // 3. Wrap/encrypt the DEK using KMS Provider (Master KEK)
  const kmsProvider = getKMSProvider();
  const kmsResult = await kmsProvider.wrapKey(dek);

  return {
    encryptedPayload: encrypted,
    encryptedDEK: kmsResult.encryptedDEK,
    iv: iv.toString('hex'),
    authTag: authTag,
    kmsKeyId: kmsResult.kmsKeyId,
    encryptionAlgorithm: 'AES-256-GCM',
    encryptionVersion: 'v1.0'
  };
}

/**
 * Envelope Decryption for Certificates:
 * Unwraps DEK via KMS provider and decrypts payload using AES-256-GCM + DEK.
 */
export async function decryptEnvelope(
  encryptedPayload: string,
  encryptedDEK: string,
  ivHex: string,
  authTagHex: string,
  kmsKeyId?: string
): Promise<string> {
  if (!encryptedPayload || !encryptedDEK || !ivHex || !authTagHex) {
    throw new Error('Missing envelope decryption metadata parameters');
  }

  // 1. Unwrap DEK using KMS Provider
  const kmsProvider = getKMSProvider();
  const dek = await kmsProvider.unwrapKey(encryptedDEK, kmsKeyId || 'local-master-kek-v1');

  // 2. Decrypt payload with DEK
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', dek, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedPayload, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
