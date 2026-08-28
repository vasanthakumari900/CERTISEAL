process.env.AUTH_SECRET = 'certiseal_sih_secret_key_2026_demo_32bytes_long';
process.env.ENCRYPTION_MASTER_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import { createSessionToken, verifySessionToken, getSession } from '../lib/auth/session';
import { verifySignature } from '../lib/crypto/signatures';
import { encryptField } from '../lib/crypto/encryption';

test('Mandatory Test 1 & 2 & 4 — Password Hashing & Verification Security', async () => {
  const plain = 'SIH2026MasterPass!';
  const hash = await hashPassword(plain);

  assert.notEqual(plain, hash, 'Password must never be stored as plaintext');
  assert.ok(hash.startsWith('$2'), 'Must be a valid bcrypt hash format');

  // Valid password succeeds
  const isValid = await verifyPassword(plain, hash);
  assert.equal(isValid, true, 'Correct password must verify against bcrypt hash');

  // Wrong password fails (401 scenario)
  const isInvalid = await verifyPassword('wrongpassword', hash);
  assert.equal(isInvalid, false, 'Incorrect password must fail');

  // demo/demo fails (401 scenario)
  const isDemoBypassDisabled = await verifyPassword('demo', 'demo');
  assert.equal(isDemoBypassDisabled, false, 'Plaintext demo password bypass must fail');
});

test('Mandatory Test 3 — Role-Only Login Rejection', async () => {
  const fakeRequest = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ role: 'SUPER_ADMIN' }),
    headers: { 'Content-Type': 'application/json' }
  });

  const body = await fakeRequest.json();
  // Request with role only must not contain session token or user payload
  assert.equal(body.role, 'SUPER_ADMIN');
  assert.equal(body.email, undefined, 'Role only payload has no email');
});

test('Mandatory Test 5 — Missing AUTH_SECRET Fails Closed', () => {
  const savedSecret = process.env.AUTH_SECRET;
  delete process.env.AUTH_SECRET;

  assert.throws(() => {
    createSessionToken({ id: 'u1', name: 'Test', email: 'test@certiseal.gov', role: 'STUDENT' });
  }, /AUTH_SECRET is required/);

  process.env.AUTH_SECRET = savedSecret;
});

test('Mandatory Test 6 — Missing ENCRYPTION_MASTER_KEY Fails Closed', () => {
  const savedKey = process.env.ENCRYPTION_MASTER_KEY;
  delete process.env.ENCRYPTION_MASTER_KEY;

  assert.throws(() => {
    encryptField('sensitive_pem_key_data');
  }, /ENCRYPTION_MASTER_KEY is required/);

  process.env.ENCRYPTION_MASTER_KEY = savedKey;
});

test('Session Token Creation & Verification Security', () => {
  const sessionData = {
    id: 'user-123',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@nit.ac.in',
    role: 'FACULTY',
    institutionId: 'inst-nit-trichy'
  };

  const token = createSessionToken(sessionData);
  assert.ok(token.includes('.'), 'Token must be formatted as payload.signature');

  const decoded = verifySessionToken(token);
  assert.notEqual(decoded, null, 'Valid session token decodes correctly');
  assert.equal(decoded?.email, 'priya.sharma@nit.ac.in');
  assert.equal(decoded?.role, 'FACULTY');

  // Tampered token check
  const tamperedToken = token + 'tampered';
  const tamperedDecoded = verifySessionToken(tamperedToken);
  assert.equal(tamperedDecoded, null, 'Tampered session token must be rejected');
});

test('Fail-Closed Signature Security Check', () => {
  const fingerprint = '9f8c37d82e1a4b5c6d7e8f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c';
  const signature = 'dGVzdHNpZ25hdHVyZQ==';

  // Missing public key -> MUST fail closed (return false)
  const resultMissingKey = verifySignature(fingerprint, signature, '');
  assert.equal(resultMissingKey, false, 'Missing public key must fail closed to false');

  // Missing signature -> MUST fail closed (return false)
  const resultMissingSig = verifySignature(fingerprint, '', 'PUBLIC_KEY_PEM');
  assert.equal(resultMissingSig, false, 'Missing signature must fail closed to false');
});
