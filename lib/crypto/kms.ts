import crypto from 'crypto';

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
 * AWS KMS Adapter Stub
 */
export class AWSKMSProvider implements KMSProvider {
  async wrapKey(dek: Buffer): Promise<KMSWrapResult> {
    throw new Error('AWS KMS requires configured AWS credentials and KMS Key ARN.');
  }
  async unwrapKey(encryptedDEK: string, kmsKeyId: string): Promise<Buffer> {
    throw new Error('AWS KMS requires configured AWS credentials.');
  }
  getProviderType(): string {
    return 'PRODUCTION_AWS_KMS';
  }
  getProviderDescription(): string {
    return 'AWS KMS Cloud Managed HSM Key Provider';
  }
}

/**
 * Factory function to retrieve the configured KMS Provider.
 * Defaults to LocalKMSProvider for SIH prototype deployment.
 */
export function getKMSProvider(): KMSProvider {
  const providerType = process.env.KMS_PROVIDER_TYPE || 'LOCAL';
  if (providerType === 'AWS_KMS') {
    return new AWSKMSProvider();
  }
  return new LocalKMSProvider();
}
