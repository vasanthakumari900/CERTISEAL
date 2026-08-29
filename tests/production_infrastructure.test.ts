process.env.AUTH_SECRET = 'certiseal_sih_secret_key_2026_demo_32bytes_long';
process.env.ENCRYPTION_MASTER_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.DATABASE_URL = 'postgresql://certx_user:certx_pass@localhost:5432/certx_db';

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { getKMSProvider, AWSKMSProvider, LocalKMSProvider } from '../lib/crypto/kms';
import { getOCRProvider, AWSTextractOCRProvider, PrototypeDocumentOCRProvider } from '../lib/services/ocr-service';
import { validateEnvironment } from '../lib/env';

test('INFRA 1 — Prisma schema is configured for PostgreSQL provider', () => {
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  assert.ok(schemaContent.includes('provider = "postgresql"'), 'Prisma schema must specify provider = "postgresql"');
});

test('INFRA 2 — KMSProvider factory returns LocalKMSProvider when KMS_PROVIDER=local', () => {
  process.env.KMS_PROVIDER = 'local';
  const kms = getKMSProvider();
  assert.equal(kms.getProviderType(), 'PROTOTYPE_LOCAL_KEK');
  assert.ok(kms instanceof LocalKMSProvider);
});

test('INFRA 3 — KMSProvider factory returns AWSKMSProvider when KMS_PROVIDER=aws', () => {
  process.env.KMS_PROVIDER = 'aws';
  process.env.AWS_REGION = 'us-east-1';
  process.env.AWS_KMS_KEY_ID = 'arn:aws:kms:us-east-1:123456789012:key/test-key-id';

  const kms = getKMSProvider();
  assert.equal(kms.getProviderType(), 'PRODUCTION_AWS_KMS');
  assert.ok(kms instanceof AWSKMSProvider);
});

test('INFRA 4 — AWSKMSProvider fails closed when AWS_REGION or AWS_KMS_KEY_ID are missing', () => {
  process.env.KMS_PROVIDER = 'aws';
  delete process.env.AWS_REGION;
  delete process.env.AWS_KMS_KEY_ID;

  assert.throws(() => {
    getKMSProvider();
  }, /AWS KMS configuration missing: AWS_REGION and AWS_KMS_KEY_ID are required/);
});

test('INFRA 5 — OCRProvider factory returns PrototypeDocumentOCRProvider when OCR_PROVIDER=prototype', () => {
  process.env.OCR_PROVIDER = 'prototype';
  const ocr = getOCRProvider();
  assert.equal(ocr.getProviderType(), 'PROTOTYPE_REGEX_EXTRACTOR');
  assert.ok(ocr instanceof PrototypeDocumentOCRProvider);
});

test('INFRA 6 — OCRProvider factory returns AWSTextractOCRProvider when OCR_PROVIDER=aws-textract', () => {
  process.env.OCR_PROVIDER = 'aws-textract';
  process.env.AWS_REGION = 'us-east-1';

  const ocr = getOCRProvider();
  assert.equal(ocr.getProviderType(), 'PRODUCTION_AWS_TEXTRACT');
  assert.ok(ocr instanceof AWSTextractOCRProvider);
});

test('INFRA 7 — AWSTextractOCRProvider fails closed when AWS_REGION is missing', () => {
  process.env.OCR_PROVIDER = 'aws-textract';
  delete process.env.AWS_REGION;

  assert.throws(() => {
    getOCRProvider();
  }, /AWS Textract configuration missing: AWS_REGION is required/);
});

test('INFRA 8 — Centralized Environment Validation enforces fail-closed checks', () => {
  process.env.KMS_PROVIDER = 'local';
  process.env.OCR_PROVIDER = 'prototype';

  const config = validateEnvironment();
  assert.ok(config.databaseUrl.includes('postgresql'));
  assert.equal(config.kmsProvider, 'local');
  assert.equal(config.ocrProvider, 'prototype');
});

test('INFRA 9 — Environment Validation throws error when DATABASE_URL is missing', () => {
  const originalDb = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;

  assert.throws(() => {
    validateEnvironment();
  }, /DATABASE_URL is required/);

  process.env.DATABASE_URL = originalDb;
});

test('INFRA 10 — Environment Validation throws error when AUTH_SECRET is missing', () => {
  const originalSecret = process.env.AUTH_SECRET;
  delete process.env.AUTH_SECRET;

  assert.throws(() => {
    validateEnvironment();
  }, /AUTH_SECRET is required/);

  process.env.AUTH_SECRET = originalSecret;
});
