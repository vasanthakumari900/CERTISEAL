process.env.AUTH_SECRET = process.env.AUTH_SECRET || 'certiseal_sih_secret_key_2026_demo_32bytes_long';
process.env.ENCRYPTION_MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalize } from '../lib/crypto/canonical';
import { generateCertificateHash } from '../lib/crypto/hashing';
import { generateInstitutionKeyPair, signFingerprint, verifySignature } from '../lib/crypto/signatures';
import { encryptField, decryptField } from '../lib/crypto/encryption';

test('Canonicalization - Key order independence', () => {
  const obj1 = { b: 2, a: 1, c: { y: 20, x: 10 } };
  const obj2 = { a: 1, c: { x: 10, y: 20 }, b: 2 };

  const str1 = canonicalize(obj1);
  const str2 = canonicalize(obj2);

  assert.equal(str1, str2, 'Canonical string must be identical regardless of key order');
  assert.equal(str1, '{"a":1,"b":2,"c":{"x":10,"y":20}}');
});

test('SHA-256 Fingerprinting - Deterministic hash & sensitivity', () => {
  const payload1 = {
    certificateId: 'CERT-2026-000123',
    studentName: 'Rahul Kumar',
    cgpa: '8.72'
  };

  const payload2 = {
    certificateId: 'CERT-2026-000123',
    studentName: 'Rahul Kumar',
    cgpa: '9.72' // Modified field
  };

  const hash1 = generateCertificateHash(payload1);
  const hash2 = generateCertificateHash(payload2);

  assert.notEqual(hash1, hash2, 'Any field change must result in a completely different hash');
  assert.equal(hash1.length, 64, 'SHA-256 hash must be 64 hex characters');
});

test('Ed25519 Digital Signature - Signing & Verification', () => {
  const keyPair = generateInstitutionKeyPair();
  assert.ok(keyPair.publicKeyPem.includes('PUBLIC KEY'), 'Valid public key PEM');
  assert.ok(keyPair.privateKeyPem.includes('PRIVATE KEY'), 'Valid private key PEM');

  const fingerprint = '9f8c37d82e1a4b5c6d7e8f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c';
  const signature = signFingerprint(fingerprint, keyPair.privateKeyPem);

  assert.ok(signature.length > 20, 'Signature generated');

  const isValid = verifySignature(fingerprint, signature, keyPair.publicKeyPem);
  assert.equal(isValid, true, 'Digital signature verification must pass for matching key');

  const isTamperedValid = verifySignature('tampered_hash_string', signature, keyPair.publicKeyPem);
  assert.equal(isTamperedValid, false, 'Signature verification must fail for altered hash');
});

test('AES-256-GCM Payload Encryption & Decryption', () => {
  const secretText = JSON.stringify({ studentName: 'Rahul Kumar', rollNo: '23CS101' });
  const encrypted = encryptField(secretText);
  assert.ok(encrypted.includes('ciphertext'), 'Encrypted JSON structure');

  const decrypted = decryptField(encrypted);
  assert.equal(decrypted, secretText, 'Decrypted payload must match original string');
});
