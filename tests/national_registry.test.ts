import test from 'node:test';
import assert from 'node:assert/strict';
import { searchNationalRegistry, detectDuplicateInstitution } from '../lib/services/institution-registry-service';
import { verifyCertificate } from '../lib/services/verification-service';
import { simulateDemoLedgerTampering, restoreDemoLedgerIntegrity, verifyLedgerIntegrity } from '../lib/services/ledger-service';

test('National Registry - Search with State & Type Filters', async () => {
  const result = await searchNationalRegistry({ state: 'Tamil Nadu' });
  assert.ok(result.institutions.length > 0, 'Institutions found in Tamil Nadu');
  assert.equal(result.institutions[0].state, 'Tamil Nadu');
});

test('National Registry - Duplicate Institution Detection', async () => {
  const dupResult = await detectDuplicateInstitution({
    officialName: 'National Institute of Technology Tiruchirappalli',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu'
  });

  assert.equal(dupResult.isDuplicate, true, 'Flags duplicate institution name');
  assert.ok(dupResult.matchedInstitution !== null, 'Returns matched institution record');
});

test('7-State Verification - VERIFICATION_UNAVAILABLE State Check', async () => {
  const res = await verifyCertificate('INST-TN-000999'); // Unonboarded college ID
  assert.equal(res.result, 'VERIFICATION_UNAVAILABLE');
  assert.equal(res.status, 'NOT_ONBOARDED');
  assert.ok(res.statusExplanation.includes('not yet joined'), 'Explains un-onboarded state');
});

test('Controlled Demo Tamper Simulator - Breach & Restore Flow', async () => {
  // 1. Verify pristine status
  const initialCheck = await verifyLedgerIntegrity();
  assert.equal(initialCheck.isValid, true, 'Initial ledger must be pristine');

  // 2. Simulate tampering
  const tamperResult = await simulateDemoLedgerTampering();
  assert.equal(tamperResult.success, true, 'Tampering simulation executed');

  const tamperedCheck = await verifyLedgerIntegrity();
  assert.equal(tamperedCheck.isValid, false, 'Ledger scanner must flag compromised status');

  // 3. Restore ledger
  const restoreResult = await restoreDemoLedgerIntegrity();
  assert.equal(restoreResult.success, true, 'Ledger restoration executed');

  const restoredCheck = await verifyLedgerIntegrity();
  assert.equal(restoredCheck.isValid, true, 'Ledger scanner must return to pristine green');
});
