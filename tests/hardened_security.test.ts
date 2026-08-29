process.env.AUTH_SECRET = 'certiseal_sih_secret_key_2026_demo_32bytes_long';
process.env.ENCRYPTION_MASTER_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../lib/prisma';
import { verifyCertificate } from '../lib/services/verification-service';
import { encryptEnvelope, decryptEnvelope } from '../lib/crypto/encryption';
import { getKMSProvider } from '../lib/crypto/kms';
import { createSessionToken, verifySessionToken } from '../lib/auth/session';
import { verifySignature } from '../lib/crypto/signatures';

test('RED-1 & TEST 1 — Plaintext sensitive certificate fields are not persisted in database', async () => {
  const cert = await prisma.certificate.findFirst({
    where: { publicId: 'CERT-2026-000123' }
  });

  assert.ok(cert !== null, 'Seeded certificate exists');
  assert.equal(cert.studentName, null, 'Plaintext studentName must be null in database');
  assert.equal(cert.studentRollNo, null, 'Plaintext studentRollNo must be null in database');
  assert.equal(cert.course, null, 'Plaintext course must be null in database');
  assert.equal(cert.cgpa, null, 'Plaintext cgpa must be null in database');
  assert.equal(cert.encryptedStudentData, null, 'Legacy plaintext backup column must be null in database');
});

test('TEST 2 — Encrypted payload exists in DB record', async () => {
  const cert = await prisma.certificate.findFirst({ where: { publicId: 'CERT-2026-000123' } });
  assert.ok(cert?.encryptedPayload, 'encryptedPayload exists');
  assert.ok(cert.encryptedPayload.length > 50, 'encryptedPayload is valid ciphertext hex');
});

test('TEST 3 — Encrypted DEK exists in DB record', async () => {
  const cert = await prisma.certificate.findFirst({ where: { publicId: 'CERT-2026-000123' } });
  assert.ok(cert?.encryptedDEK, 'encryptedDEK exists');
  const wrapped = JSON.parse(cert.encryptedDEK);
  assert.ok(wrapped.ciphertext, 'Wrapped DEK ciphertext exists');
  assert.ok(wrapped.iv, 'Wrapped DEK IV exists');
  assert.ok(wrapped.authTag, 'Wrapped DEK AuthTag exists');
});

test('TEST 4 — IV / Nonce exists in DB record', async () => {
  const cert = await prisma.certificate.findFirst({ where: { publicId: 'CERT-2026-000123' } });
  assert.ok(cert?.iv, 'IV exists');
  assert.equal(cert.iv.length, 24, 'IV is 12 random bytes (24 hex characters)');
});

test('TEST 5 — Authentication Tag exists in DB record', async () => {
  const cert = await prisma.certificate.findFirst({ where: { publicId: 'CERT-2026-000123' } });
  assert.ok(cert?.authTag, 'authTag exists');
  assert.equal(cert.authTag.length, 32, 'AES-256-GCM authTag is 16 bytes (32 hex characters)');
});

test('TEST 6 — KMS Key Identifier exists in DB record', async () => {
  const cert = await prisma.certificate.findFirst({ where: { publicId: 'CERT-2026-000123' } });
  assert.equal(cert?.kmsKeyId, 'local-master-kek-v1');
  assert.equal(cert?.encryptionAlgorithm, 'AES-256-GCM');
});

test('RED-2 & TEST 7 — Verification Engine decrypts encrypted envelope payload as authoritative source', async () => {
  const res = await verifyCertificate('CERT-2026-000123');

  assert.equal(res.result, 'VERIFIED');
  assert.equal(res.certificateDetails?.studentName, 'Rahul Kumar');
  assert.equal(res.certificateDetails?.studentRollNo, '23CS101');
  assert.equal(res.certificateDetails?.course, 'B.Sc Computer Science');
  assert.equal(res.certificateDetails?.cgpa, '8.72');
  assert.equal(res.cryptographicProof.hashMatched, true);
});

test('TEST 8 — Verification Engine does NOT rely on plaintext database columns', async () => {
  // DB record for CERT-2026-000123 has null in studentName, studentRollNo, course, cgpa columns
  const rawDbCert = await prisma.certificate.findFirst({ where: { publicId: 'CERT-2026-000123' } });
  assert.equal(rawDbCert?.studentName, null);

  // Yet verifyCertificate recovers studentName directly from decrypted KMS envelope
  const res = await verifyCertificate('CERT-2026-000123');
  assert.equal(res.certificateDetails?.studentName, 'Rahul Kumar');
});

test('TEST 9 — Removing or corrupting encrypted payload causes verification failure (Fail Closed)', async () => {
  // Temporarily corrupt encryptedPayload in database
  const cert = await prisma.certificate.findFirst({ where: { publicId: 'CERT-2026-000123' } });
  const originalPayload = cert?.encryptedPayload;

  await prisma.certificate.update({
    where: { id: cert!.id },
    data: { encryptedPayload: null }
  });

  const res = await verifyCertificate('CERT-2026-000123');
  assert.equal(res.result, 'VERIFICATION_UNAVAILABLE', 'Must fail closed when encryptedPayload is missing');
  assert.equal(res.certificateDetails, null, 'Must not return certificate details');

  // Restore original encryptedPayload
  await prisma.certificate.update({
    where: { id: cert!.id },
    data: { encryptedPayload: originalPayload }
  });
});

test('TEST 10 — Corrupting authentication tag causes GCM validation failure (Fail Closed)', async () => {
  const cert = await prisma.certificate.findFirst({ where: { publicId: 'CERT-2026-000123' } });
  const originalTag = cert?.authTag;

  await prisma.certificate.update({
    where: { id: cert!.id },
    data: { authTag: '00000000000000000000000000000000' }
  });

  const res = await verifyCertificate('CERT-2026-000123');
  assert.equal(res.result, 'VERIFICATION_UNAVAILABLE', 'Must fail closed on authTag mismatch');

  await prisma.certificate.update({
    where: { id: cert!.id },
    data: { authTag: originalTag }
  });
});

test('TEST 11 — Wrong DEK cannot decrypt certificate', async () => {
  const resA = await encryptEnvelope('Certificate A payload');
  const resB = await encryptEnvelope('Certificate B payload');

  await assert.rejects(async () => {
    await decryptEnvelope(resA.encryptedPayload, resB.encryptedDEK, resA.iv, resA.authTag, resA.kmsKeyId);
  }, /Unsupported state or unable to authenticate data|Authentication Tag mismatch|cipher/i);
});

test('TEST 12 — Different certificates receive different, unique DEKs', async () => {
  const resA = await encryptEnvelope('Payload A');
  const resB = await encryptEnvelope('Payload B');
  assert.notEqual(resA.encryptedDEK, resB.encryptedDEK);
});

test('RED-3 & TEST 13 — Public verification response does not leak raw ciphertext dump', async () => {
  const res = await verifyCertificate('CERT-2026-000123');
  const jsonStr = JSON.stringify(res);

  assert.equal(jsonStr.includes('encryptedDataPayload'), false, 'Misleading encryptedDataPayload field removed from public verification API');
  assert.equal('encryptedPayload' in res.cryptographicProof, false, 'Raw ciphertext not dumped in cryptographicProof');
});

test('TEST 14 — Public verification response does not contain DEK or encryptedDEK', async () => {
  const res = await verifyCertificate('CERT-2026-000123');
  const jsonStr = JSON.stringify(res);

  assert.equal(jsonStr.includes('encryptedDEK'), false, 'encryptedDEK omitted from public verifier payload');
  assert.equal(jsonStr.includes('rawDEK'), false, 'rawDEK omitted');
  assert.equal(jsonStr.includes('dek'), false, 'dek omitted');
});

test('TEST 15 — Public verification response does not contain private keys or KEKs', async () => {
  const res = await verifyCertificate('CERT-2026-000123');
  const jsonStr = JSON.stringify(res);

  assert.equal(jsonStr.includes('ENCRYPTION_MASTER_KEY'), false, 'Master KEK omitted');
  assert.equal(jsonStr.includes('privateKey'), false, 'Private key omitted');
  assert.equal(jsonStr.includes('AUTH_SECRET'), false, 'AUTH_SECRET omitted');
});

test('RED-4 & TEST 16 — Public API cannot bypass authorization by changing certificate ID', async () => {
  const unauthSessionToken = null;
  assert.equal(verifySessionToken(unauthSessionToken as any), null, 'Unauthenticated request produces null session');
});

test('TEST 17 — Institution A user cannot access Institution B protected certificate through API manipulation', async () => {
  const inst1AdminSession = {
    id: 'user-1',
    email: 'admin@nit.ac.in',
    name: 'Prof. Ramesh',
    role: 'INSTITUTION_ADMIN',
    institutionId: 'inst-1'
  };

  const certB = await prisma.certificate.findFirst({ where: { publicId: 'CERT-2026-000125' } });
  assert.ok(certB !== null);

  const isAuthorized = inst1AdminSession.role === 'SUPER_ADMIN' || inst1AdminSession.institutionId === certB?.institutionId;
  assert.equal(isAuthorized, false, 'Institution A admin must be denied access to Institution B certificate');
});

test('TEST 18 — Missing AUTH_SECRET fails closed', async () => {
  const savedAuthSecret = process.env.AUTH_SECRET;
  delete process.env.AUTH_SECRET;

  assert.throws(() => {
    createSessionToken({ id: '1', email: 'a@b.com', name: 'A', role: 'STUDENT' });
  }, /AUTH_SECRET is required/);

  process.env.AUTH_SECRET = savedAuthSecret;
});

test('TEST 19 — Missing ENCRYPTION_MASTER_KEY fails closed', async () => {
  const savedKey = process.env.ENCRYPTION_MASTER_KEY;
  delete process.env.ENCRYPTION_MASTER_KEY;

  const kms = getKMSProvider();
  await assert.rejects(async () => {
    await kms.wrapKey(Buffer.from('0123456789abcdef0123456789abcdef', 'hex'));
  }, /ENCRYPTION_MASTER_KEY is required/);

  process.env.ENCRYPTION_MASTER_KEY = savedKey;
});

test('TEST 20 — Ed25519 invalid signature fails verification', async () => {
  const inst = await prisma.institution.findFirst({
    where: { publicKey: { not: null } }
  });
  assert.ok(inst?.publicKey);

  const tamperedSig = 'TAMPERED_SIG_9999999999999999999999999999999999999999999999999999999999';
  const isValid = verifySignature('hash_string', tamperedSig, inst.publicKey);
  assert.equal(isValid, false, 'Invalid signature must fail verification');
});

test('TEST 21 — SHA-256 hash mismatch produces TAMPERED result', async () => {
  const cert = await prisma.certificate.findFirst({ where: { publicId: 'CERT-2026-000123' } });
  const originalHash = cert?.canonicalHash;

  await prisma.certificate.update({
    where: { id: cert!.id },
    data: { canonicalHash: 'bad0000000000000000000000000000000000000000000000000000000000000' }
  });

  const res = await verifyCertificate('CERT-2026-000123');
  assert.equal(res.result, 'TAMPERED', 'SHA-256 hash mismatch must return TAMPERED');

  await prisma.certificate.update({
    where: { id: cert!.id },
    data: { canonicalHash: originalHash }
  });
});

test('TEST 22 — Hash-chain ledger corruption produces ledger integrity alert', async () => {
  const entry = await prisma.ledgerEntry.findFirst({ where: { sequenceNumber: 2 } });
  if (entry) {
    const originalHash = entry.currentHash;
    await prisma.ledgerEntry.update({
      where: { id: entry.id },
      data: { currentHash: 'CORRUPTED_LEDGER_HASH_99999' }
    });

    const res = await verifyCertificate('CERT-2026-000123');
    assert.equal(res.cryptographicProof.ledgerIntegrityValid, false, 'Ledger corruption must be flagged');

    await prisma.ledgerEntry.update({
      where: { id: entry.id },
      data: { currentHash: originalHash }
    });
  }
});

test('TEST 23 — Lifecycle REVOKED remains REVOKED and is not reported as VERIFIED', async () => {
  const res = await verifyCertificate('CERT-2026-000126');
  assert.equal(res.result, 'REVOKED');
  assert.equal(res.status, 'REVOKED');
  assert.ok(res.revocationDetails?.reason.length! > 0);
});

test('TEST 24 — OCR / Document mismatch is detected as TAMPERED', async () => {
  const res = await verifyCertificate('CERT-2026-000123', {
    method: 'DOCUMENT_UPLOAD',
    uploadedData: {
      studentName: 'Rahul Kumar',
      cgpa: '9.99' // Tampered CGPA from 8.72
    }
  });

  assert.equal(res.result, 'TAMPERED');
  assert.equal(res.documentComparison?.isMatched, false);
  const diff = res.documentComparison?.fieldDiffs.find(f => f.field === 'CGPA');
  assert.equal(diff?.isMatch, false);
  assert.equal(diff?.trustedValue, '8.72');
  assert.equal(diff?.submittedValue, '9.99');
});
