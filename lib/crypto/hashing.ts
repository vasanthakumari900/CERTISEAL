import crypto from 'crypto';
import { canonicalize } from './canonical';

/**
 * Generates deterministic SHA-256 fingerprint for certificate structured data.
 */
export function generateCertificateHash(payload: Record<string, any>): string {
  const canonicalString = canonicalize(payload);
  return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
}

/**
 * Generates SHA-256 hash for ledger entry chaining.
 */
export function generateLedgerHash(entry: {
  recordId: string;
  certificateId: string;
  previousHash: string;
  timestamp: string;
  operation: string;
  actorId: string;
  signatureRef: string;
}): string {
  const canonicalString = canonicalize(entry);
  return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
}

/**
 * Generates SHA-256 hash for audit log events.
 */
export function generateAuditHash(event: Record<string, any>, previousHash: string): string {
  const payload = { ...event, previousHash };
  const canonicalString = canonicalize(payload);
  return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
}
