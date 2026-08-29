/**
 * Centralized Environment Variable Validation for CERTX Production & Development Architecture.
 * Enforces fail-closed security for database, session secret, KMS provider, and OCR provider configurations.
 */

export interface EnvConfig {
  databaseUrl: string;
  authSecret: string;
  kmsProvider: 'local' | 'aws';
  encryptionMasterKey?: string;
  awsRegion?: string;
  awsKmsKeyId?: string;
  ocrProvider: 'prototype' | 'aws-textract';
  isProduction: boolean;
}

export function validateEnvironment(): EnvConfig {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for database connectivity');
  }

  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    throw new Error('AUTH_SECRET is required for server-side HMAC session signing');
  }

  const kmsProvider = (process.env.KMS_PROVIDER || 'local').toLowerCase() as 'local' | 'aws';
  let encryptionMasterKey = process.env.ENCRYPTION_MASTER_KEY;
  let awsRegion = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  let awsKmsKeyId = process.env.AWS_KMS_KEY_ID;

  if (kmsProvider === 'local' && !encryptionMasterKey) {
    throw new Error('ENCRYPTION_MASTER_KEY is required when KMS_PROVIDER=local');
  }

  if (kmsProvider === 'aws' && (!awsRegion || !awsKmsKeyId)) {
    throw new Error('AWS_REGION and AWS_KMS_KEY_ID are required when KMS_PROVIDER=aws');
  }

  const ocrProvider = (process.env.OCR_PROVIDER || 'prototype').toLowerCase() as 'prototype' | 'aws-textract';
  if (ocrProvider === 'aws-textract' && !awsRegion) {
    throw new Error('AWS_REGION is required when OCR_PROVIDER=aws-textract');
  }

  return {
    databaseUrl,
    authSecret,
    kmsProvider,
    encryptionMasterKey,
    awsRegion,
    awsKmsKeyId,
    ocrProvider,
    isProduction: process.env.NODE_ENV === 'production'
  };
}
