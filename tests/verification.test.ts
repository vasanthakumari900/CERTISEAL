import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyCertificate } from '../lib/services/verification-service';
import { verifyLedgerIntegrity, restoreDemoLedgerIntegrity } from '../lib/services/ledger-service';

test('Verification Engine - VERIFIED state check', async () => {
  await restoreDemoLedgerIntegrity();
  const res = await verifyCertificate('CERT-2026-000123');
  assert.equal(res.result, 'VERIFIED');
  assert.equal(res.status, 'VERIFIED');
  assert.equal(res.cryptographicProof.hashMatched, true);
  assert.equal(res.cryptographicProof.signatureValid, true);
  assert.equal(res.cryptographicProof.ledgerIntegrityValid, true);
  assert.equal(res.certificateDetails?.studentName, 'Rahul Kumar');
});

test('Verification Engine - ON_HOLD state check with explicit message', async () => {
  const res = await verifyCertificate('CERT-2026-000124');
  assert.equal(res.result, 'ON_HOLD');
  assert.equal(res.cryptographicProof.hashMatched, true);
  assert.equal(res.cryptographicProof.signatureValid, true);
  assert.ok(res.statusExplanation.includes('administrative hold'), 'Communicates institutional hold');
  assert.ok(res.holdDetails?.reason.includes('clearance'), 'Provides hold reason');
});

test('Verification Engine - RELEASED state check', async () => {
  const res = await verifyCertificate('CERT-2026-000125');
  assert.equal(res.result, 'RELEASED');
  assert.equal(res.cryptographicProof.hashMatched, true);
  assert.equal(res.cryptographicProof.signatureValid, true);
});

test('Verification Engine - REVOKED state check', async () => {
  const res = await verifyCertificate('CERT-2026-000126');
  assert.equal(res.result, 'REVOKED');
  assert.equal(res.cryptographicProof.signatureValid, true);
  assert.ok(res.revocationDetails?.reason.length! > 0, 'Revocation reason present');
});

test('Verification Engine - TAMPERED document detection', async () => {
  const res = await verifyCertificate('CERT-2026-000123', {
    method: 'DOCUMENT_UPLOAD',
    uploadedData: {
      studentName: 'Rahul Kumar',
      cgpa: '9.72' // Modified from 8.72
    }
  });

  assert.equal(res.result, 'TAMPERED');
  assert.equal(res.documentComparison?.isMatched, false);
  const cgpaDiff = res.documentComparison?.fieldDiffs.find(f => f.field === 'CGPA');
  assert.equal(cgpaDiff?.isMatch, false);
  assert.equal(cgpaDiff?.trustedValue, '8.72');
  assert.equal(cgpaDiff?.submittedValue, '9.72');
});

test('Verification Engine - NOT_FOUND state check', async () => {
  const res = await verifyCertificate('CERT-NONEXISTENT-9999');
  assert.equal(res.result, 'NOT_FOUND');
  assert.equal(res.institution, null);
});

test('Ledger Integrity Scanner - Genesis to Tip validation', async () => {
  await restoreDemoLedgerIntegrity();
  const report = await verifyLedgerIntegrity();
  assert.equal(report.isValid, true, 'Seeded ledger hash chain must be 100% valid');
  assert.ok(report.totalBlocks > 0, 'Blocks exist in ledger');
});
