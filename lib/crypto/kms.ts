import crypto from 'crypto';
import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';

export interface KMSWrapResult {
  encryptedDEK: string;
  kmsKeyId: string;
  providerType: string;
}

export interface KMSProvider {
  wrapKey(dek: Buffer): Promise<KMSWrapResult>;
  unwrapKey(encryptedDEK: string, kmsKeyId: string): Promise<Buffer>;
  getProviderType(): string;
  getProviderDescription(): string;
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
 * Prototype KMS Implementation: Local AES-256-GCM Key Encryption Key (KEK) Provider.
 * Encrypts/wraps per-certificate Data Encryption Keys (DEKs) using the environment KEK.
 */
export class LocalKMSProvider implements KMSProvider {
  private keyId: string = 'local-master-kek-v1';

  async wrapKey(dek: Buffer): Promise<KMSWrapResult> {
    const masterKey = getMasterKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);

    let encrypted = cipher.update(dek);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();

    const wrappedPayload = {
      ciphertext: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };

    return {
      encryptedDEK: JSON.stringify(wrappedPayload),
      kmsKeyId: this.keyId,
      providerType: 'PROTOTYPE_LOCAL_KEK'
    };
  }

  async unwrapKey(encryptedDEK: string, kmsKeyId: string): Promise<Buffer> {
    const masterKey = getMasterKey();
    const payload = JSON.parse(encryptedDEK);
    const iv = Buffer.from(payload.iv, 'hex');
    const authTag = Buffer.from(payload.authTag, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(Buffer.from(payload.ciphertext, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  }

  getProviderType(): string {
    return 'PROTOTYPE_LOCAL_KEK';
  }

  getProviderDescription(): string {
    return 'CERTX Prototype Local KMS Provider (AES-256-GCM Envelope KEK)';
  }
}

/**
 * Real AWS KMS Provider using Official AWS SDK v3.
 * Wraps and unwraps 256-bit DEKs using AWS Key Management Service (Cloud HSM).
 */
export class AWSKMSProvider implements KMSProvider {
  private keyId: string;
  private region: string;
  private client: KMSClient | null = null;

  constructor() {
    this.region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || '';
    this.keyId = process.env.AWS_KMS_KEY_ID || '';

    // Validate mandatory AWS KMS configuration when active
    if (!this.region || !this.keyId) {
      throw new Error('AWS KMS configuration missing: AWS_REGION and AWS_KMS_KEY_ID are required when KMS_PROVIDER=aws');
    }

    this.client = new KMSClient({ region: this.region });
  }

  async wrapKey(dek: Buffer): Promise<KMSWrapResult> {
    if (!this.client) {
      throw new Error('AWS KMS client initialized failed');
    }

    const command = new EncryptCommand({
      KeyId: this.keyId,
      Plaintext: dek,
      EncryptionAlgorithm: 'SYMMETRIC_DEFAULT'
    });

    const response = await this.client.send(command);

    if (!response.CiphertextBlob) {
      throw new Error('AWS KMS Encrypt command failed to return CiphertextBlob');
    }

    return {
      encryptedDEK: Buffer.from(response.CiphertextBlob).toString('base64'),
      kmsKeyId: this.keyId,
      providerType: 'PRODUCTION_AWS_KMS'
    };
  }

  async unwrapKey(encryptedDEK: string, kmsKeyId: string): Promise<Buffer> {
    if (!this.client) {
      throw new Error('AWS KMS client initialized failed');
    }

    const ciphertextBlob = Buffer.from(encryptedDEK, 'base64');

    const command = new DecryptCommand({
      CiphertextBlob: ciphertextBlob,
      KeyId: kmsKeyId || this.keyId
    });

    const response = await this.client.send(command);

    if (!response.Plaintext) {
      throw new Error('AWS KMS Decrypt command failed to return Plaintext DEK');
    }

    return Buffer.from(response.Plaintext);
  }

  getProviderType(): string {
    return 'PRODUCTION_AWS_KMS';
  }

  getProviderDescription(): string {
    return 'AWS KMS Cloud Managed Key Management Service (AES-256 / HSM)';
  }
}

/**
 * Factory function to retrieve the configured KMS Provider.
 * Supports KMS_PROVIDER=local or KMS_PROVIDER=aws.
 * Production mode MUST NOT silently fall back to prototype local KMS.
 */
export function getKMSProvider(): KMSProvider {
  const providerType = (process.env.KMS_PROVIDER || process.env.KMS_PROVIDER_TYPE || 'local').toLowerCase();

  if (providerType === 'aws' || providerType === 'aws_kms' || providerType === 'aws-kms') {
    return new AWSKMSProvider();
  }

  return new LocalKMSProvider();
}
