import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import { createSessionToken, verifySessionToken } from '../lib/auth/session';
import { verifySignature } from '../lib/crypto/signatures';

test('Password Hashing & Verification Security', () => {
  const plain = 'SIH2026MasterPass!';
  const hash = hashPassword(plain);

  assert.notEqual(plain, hash, 'Password must never be plaintext');
  assert.equal(verifyPassword(plain, hash), true, 'Correct password verifies');
  assert.equal(verifyPassword('wrongpass', hash), false, 'Incorrect password fails');
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
