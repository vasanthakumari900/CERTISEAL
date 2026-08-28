import { prisma } from '../prisma';
import { generateLedgerHash } from '../crypto/hashing';

export const GENESIS_HASH = "GENESIS_BLOCK_CERTISEAL_000000000000000000000000000000000000000000000000";

export interface LedgerVerificationReport {
  isValid: boolean;
  totalBlocks: number;
  checkedAt: string;
  firstCompromisedIndex: number | null;
  compromisedBlock: any | null;
  genesisHash: string;
  tipHash: string;
  blocks: Array<{
    index: number;
    sequenceNumber: number;
    id: string;
    certificateId: string;
    operation: string;
    previousHash: string;
    currentHash: string;
    recalculatedHash: string;
    isValid: boolean;
    timestamp: string;
  }>;
}

/**
 * Appends a new entry to the immutable hash-chained ledger with sequence numbers.
 */
export async function appendLedgerEntry(data: {
  certificateId: string;
  institutionId: string;
  operation: string;
  actorId: string;
  signatureRef: string;
}) {
  const lastEntry = await prisma.ledgerEntry.findFirst({
    orderBy: { sequenceNumber: 'desc' }
  });

  const nextSeq = lastEntry ? lastEntry.sequenceNumber + 1 : 1;
  const previousHash = lastEntry ? lastEntry.currentHash : GENESIS_HASH;
  const timestamp = new Date().toISOString();
  const recordId = `LEDGER-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const currentHash = generateLedgerHash({
    recordId,
    certificateId: data.certificateId,
    previousHash,
    timestamp,
    operation: data.operation,
    actorId: data.actorId,
    signatureRef: data.signatureRef
  });

  const newEntry = await prisma.ledgerEntry.create({
    data: {
      id: recordId,
      sequenceNumber: nextSeq,
      certificateId: data.certificateId,
      institutionId: data.institutionId,
      operation: data.operation,
      actorId: data.actorId,
      previousHash,
      currentHash,
      signatureRef: data.signatureRef,
      timestamp: new Date(timestamp)
    }
  });

  return newEntry;
}

/**
 * Verifies the integrity of the entire hash-chained ledger from Genesis to Tip.
 */
export async function verifyLedgerIntegrity(): Promise<LedgerVerificationReport> {
  const entries = await prisma.ledgerEntry.findMany({
    orderBy: { sequenceNumber: 'asc' }
  });

  if (entries.length === 0) {
    return {
      isValid: true,
      totalBlocks: 0,
      checkedAt: new Date().toISOString(),
      firstCompromisedIndex: null,
      compromisedBlock: null,
      genesisHash: GENESIS_HASH,
      tipHash: GENESIS_HASH,
      blocks: []
    };
  }

  let overallValid = true;
  let firstCompromisedIndex: number | null = null;
  let compromisedBlock: any | null = null;

  const blockReports = [];
  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const timestampStr = entry.timestamp.toISOString();

    const recalculatedHash = generateLedgerHash({
      recordId: entry.id,
      certificateId: entry.certificateId,
      previousHash: entry.previousHash,
      timestamp: timestampStr,
      operation: entry.operation,
      actorId: entry.actorId,
      signatureRef: entry.signatureRef
    });

    const isPrevValid = entry.previousHash === expectedPrevHash;
    const isCurrentValid = entry.currentHash === recalculatedHash;
    const blockValid = isPrevValid && isCurrentValid;

    if (!blockValid && overallValid) {
      overallValid = false;
      firstCompromisedIndex = i + 1;
      compromisedBlock = entry;
    }

    blockReports.push({
      index: i + 1,
      sequenceNumber: entry.sequenceNumber,
      id: entry.id,
      certificateId: entry.certificateId,
      operation: entry.operation,
      previousHash: entry.previousHash,
      currentHash: entry.currentHash,
      recalculatedHash,
      isValid: blockValid,
      timestamp: timestampStr
    });

    expectedPrevHash = entry.currentHash;
  }

  return {
    isValid: overallValid,
    totalBlocks: entries.length,
    checkedAt: new Date().toISOString(),
    firstCompromisedIndex,
    compromisedBlock,
    genesisHash: GENESIS_HASH,
    tipHash: entries[entries.length - 1].currentHash,
    blocks: blockReports
  };
}

/**
 * CONTROLLED DEMO TAMPER SIMULATOR (SIH Judge Demonstration Mode)
 * Deliberately modifies currentHash of entry #2 or #3 to trigger RED alert.
 */
export async function simulateDemoLedgerTampering() {
  const targetEntry = await prisma.ledgerEntry.findFirst({
    skip: 1, // Entry #2
    orderBy: { sequenceNumber: 'asc' }
  });

  if (targetEntry) {
    await prisma.ledgerEntry.update({
      where: { id: targetEntry.id },
      data: {
        currentHash: 'TAMPERED_HASH_BAD_ACTOR_ALTERED_RECORD_99999999999999999999999'
      }
    });
    return { success: true, tamperedBlockId: targetEntry.id };
  }
  return { success: false, reason: 'No ledger blocks to tamper' };
}

/**
 * Restores pristine ledger integrity for demo environment.
 */
export async function restoreDemoLedgerIntegrity() {
  const entries = await prisma.ledgerEntry.findMany({
    orderBy: { sequenceNumber: 'asc' }
  });

  let expectedPrev = GENESIS_HASH;

  for (const entry of entries) {
    const timestampStr = entry.timestamp.toISOString();
    const correctHash = generateLedgerHash({
      recordId: entry.id,
      certificateId: entry.certificateId,
      previousHash: expectedPrev,
      timestamp: timestampStr,
      operation: entry.operation,
      actorId: entry.actorId,
      signatureRef: entry.signatureRef
    });

    await prisma.ledgerEntry.update({
      where: { id: entry.id },
      data: {
        previousHash: expectedPrev,
        currentHash: correctHash
      }
    });

    expectedPrev = correctHash;
  }

  return { success: true };
}
