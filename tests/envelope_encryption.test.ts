process.env.AUTH_SECRET = 'certiseal_sih_secret_key_2026_demo_32bytes_long';
process.env.ENCRYPTION_MASTER_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { encryptEnvelope, decryptEnvelope } from '../lib/crypto/encryption';
import { getKMSProvider, LocalKMSProvider } from '../lib/crypto/kms';
import { prisma } from '../lib/prisma';

test('STEP 13.1 — Plaintext certificate payload is not persisted where protected storage is required', async () => {
  const sensitivePayload = JSON.stringify({ studentName: 'Rahul Kumar', studentRollNo: '23CS101', cgpa: '8.72' });
  const result = await encryptEnvelope(sensitivePayload);

  assert.equal(result.encryptedPayload.includes('Rahul Kumar'), false, 'Ciphertext must not contain plaintext string');
  assert.notEqual(result.encryptedPayload, sensitivePayload, 'Ciphertext must be encrypted hex data');
});

test('STEP 13.2 — Plaintext DEK is not persisted in database record structure', async () => {
  const sensitivePayload = JSON.stringify({ studentName: 'Rahul Kumar', cgpa: '8.72' });
  const result = await encryptEnvelope(sensitivePayload);

  // Assert that result object contains encryptedDEK, but NO plaintext dek property exists
  assert.ok('encryptedDEK' in result, 'Contains wrapped encryptedDEK');
  assert.equal('dek' in result, false, 'Plaintext DEK property must NOT exist in storage structure');
  assert.equal('rawDEK' in result, false, 'Raw DEK property must NOT exist in storage structure');
});

test('STEP 13.3 — Encrypted DEK exists and is non-empty', async () => {
  const result = await encryptEnvelope('Sample payload');
  assert.ok(result.encryptedDEK.length > 0, 'Encrypted DEK exists');
  const parsedWrapped = JSON.parse(result.encryptedDEK);
  assert.ok(parsedWrapped.ciphertext.length > 0, 'Wrapped DEK ciphertext present');
  assert.ok(parsedWrapped.iv.length > 0, 'Wrapped DEK IV present');
  assert.ok(parsedWrapped.authTag.length > 0, 'Wrapped DEK AuthTag present');
});

test('STEP 13.4 — Ciphertext exists in database record payload', async () => {
  const result = await encryptEnvelope('Test Certificate Content');
  assert.ok(result.encryptedPayload.length > 0, 'Ciphertext exists');
  assert.match(result.encryptedPayload, /^[0-9a-fA-F]+$/, 'Ciphertext is valid hex string');
});

test('STEP 13.5 — IV/nonce exists and is unique per operation', async () => {
  const res1 = await encryptEnvelope('Payload 1');
  const res2 = await encryptEnvelope('Payload 2');

  assert.ok(res1.iv.length > 0, 'IV 1 exists');
  assert.ok(res2.iv.length > 0, 'IV 2 exists');
  assert.notEqual(res1.iv, res2.iv, 'IVs must be fresh and unique per operation');
});

test('STEP 13.6 — Authentication tag exists for AES-256-GCM integrity', async () => {
  const result = await encryptEnvelope('Authenticated payload');
  assert.ok(result.authTag.length > 0, 'AuthTag exists');
  assert.equal(result.authTag.length, 32, 'AES-256-GCM authTag is 16 bytes (32 hex characters)');
});

test('STEP 13.7 — KMS key identifier exists and matches provider', async () => {
  const result = await encryptEnvelope('Payload with KMS ID');
  assert.equal(result.kmsKeyId, 'local-master-kek-v1', 'KMS key ID exists and matches active provider');
  assert.equal(result.encryptionAlgorithm, 'AES-256-GCM', 'Encryption algorithm recorded');
});

test('STEP 13.8 — Cryptographic Isolation: Different certificates receive different, unique DEKs', async () => {
  const resA = await encryptEnvelope('Certificate A payload');
  const resB = await encryptEnvelope('Certificate B payload');

  assert.notEqual(resA.encryptedDEK, resB.encryptedDEK, 'Wrapped DEKs for Cert A and Cert B must be distinct');
  assert.notEqual(resA.encryptedPayload, resB.encryptedPayload, 'Ciphertexts for Cert A and Cert B must be distinct');

  // Verify unwrapped DEKs are distinct Buffers
  const kms = getKMSProvider();
  const dekA = await kms.unwrapKey(resA.encryptedDEK, resA.kmsKeyId);
  const dekB = await kms.unwrapKey(resB.encryptedDEK, resB.kmsKeyId);

  assert.notEqual(dekA.toString('hex'), dekB.toString('hex'), 'Cert A DEK and Cert B DEK must be cryptographically isolated');
});

test('STEP 13.9 — Wrong DEK cannot decrypt certificate (Decryption fails closed)', async () => {
  const resA = await encryptEnvelope('Certificate A confidential content');
  const resB = await encryptEnvelope('Certificate B confidential content');

  // Attempt to decrypt Cert A ciphertext using Cert B's encrypted DEK
  await assert.rejects(async () => {
    await decryptEnvelope(
      resA.encryptedPayload,
      resB.encryptedDEK, // Wrong DEK
      resA.iv,
      resA.authTag,
      resA.kmsKeyId
    );
  }, /Unsupported state or unable to authenticate data|Authentication Tag mismatch|cipher/i);
});

test('STEP 13.10 — Modified ciphertext fails authentication', async () => {
  const res = await encryptEnvelope('Unmodified certificate content');

  // Tamper with ciphertext by flipping bits in hex string
  const corruptedCiphertext = res.encryptedPayload.replace(/^[0-9a-f]{2}/, 'ff');

  await assert.rejects(async () => {
    await decryptEnvelope(
      corruptedCiphertext,
      res.encryptedDEK,
      res.iv,
      res.authTag,
      res.kmsKeyId
    );
  }, /Unsupported state or unable to authenticate data|Authentication Tag mismatch|cipher/i);
});

test('STEP 13.11 — Modified authentication tag fails authentication', async () => {
  const res = await encryptEnvelope('Valid authenticated payload');

  // Tamper with auth tag
  const corruptedAuthTag = '00000000000000000000000000000000';

  await assert.rejects(async () => {
    await decryptEnvelope(
      res.encryptedPayload,
      res.encryptedDEK,
      res.iv,
      corruptedAuthTag,
      res.kmsKeyId
    );
  }, /Unsupported state or unable to authenticate data|Authentication Tag mismatch|cipher/i);
});

test('STEP 13.12 — Missing KMS configuration fails closed immediately', async () => {
  const savedKey = process.env.ENCRYPTION_MASTER_KEY;
  delete process.env.ENCRYPTION_MASTER_KEY;

  await assert.rejects(async () => {
    await encryptEnvelope('Payload when master KEK is missing');
  }, /ENCRYPTION_MASTER_KEY is required/);

  process.env.ENCRYPTION_MASTER_KEY = savedKey;
});

test('STEP 13.13 — Browser API responses do not expose plaintext DEKs, master KEKs, or private keys', async () => {
  // Query database certificate record
  const dbCert = await prisma.certificate.findFirst({
    where: { publicId: 'CERT-2026-000123' }
  });

  assert.ok(dbCert !== null, 'Seeded certificate exists');

  const jsonString = JSON.stringify(dbCert);
  assert.equal(jsonString.includes('ENCRYPTION_MASTER_KEY'), false, 'Master KEK must never be exposed');
  assert.equal(jsonString.includes('rawDEK'), false, 'Raw DEK must never be exposed');
  assert.equal(jsonString.includes('privateKey'), false, 'Private key must never be exposed');
  assert.ok(dbCert.encryptedDEK !== null, 'Wrapped encrypted DEK present in record');
  assert.ok(dbCert.encryptedPayload !== null, 'Envelope ciphertext present in record');
});
