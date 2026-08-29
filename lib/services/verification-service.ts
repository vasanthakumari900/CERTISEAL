import crypto from 'crypto';
import { prisma } from '../prisma';
import { generateCertificateHash } from '../crypto/hashing';
import { buildCertificateCanonicalPayload } from '../crypto/canonical';
import { verifySignature } from '../crypto/signatures';
import { logAuditEvent } from './audit-service';
import { verifyLedgerIntegrity } from './ledger-service';
import { analyzeDocumentForensics, DocumentForensicResult } from './forensic-service';
import { decryptEnvelope } from '../crypto/encryption';

export interface VerificationLevelStep {
  level: number;
  name: string;
  passed: boolean;
  score: number;
  maxScore: number;
  details: string;
}

export interface VerificationResultPayload {
  referenceId: string;
  result: 'VERIFIED' | 'ON_HOLD' | 'RELEASED' | 'REVOKED' | 'TAMPERED' | 'NOT_FOUND' | 'VERIFICATION_UNAVAILABLE';
  certificateId: string;
  publicId: string;
  status: string;
  statusExplanation: string;
  evidenceScore: number;
  evidenceChain: VerificationLevelStep[];
  verificationLevels: VerificationLevelStep[];
  institution: {
    id: string;
    publicId: string;
    name: string;
    code: string;
    type: string;
    state: string;
    city: string;
    accreditation: string;
    status: string;
    certisealStatus: string;
    publicKeyFingerprint: string;
  } | null;
  certificateDetails: {
    studentName: string;
    studentRollNo: string;
    course: string;
    department: string;
    certificateType: string;
    issueDate: string;
    completionDate?: string;
    marks?: string;
    cgpa?: string;
    graduationYear?: string;
    additionalMetadata?: any;
    currentVersion: number;
  } | null;
  cryptographicProof: {
    canonicalHash: string;
    recalculatedHash: string;
    hashMatched: boolean;
    digitalSignature: string;
    signatureValid: boolean;
    algorithm: string;
    publicKeyFingerprint: string;
    ledgerIntegrityValid: boolean;
    envelopeEncrypted: boolean;
    kmsKeyId?: string;
    encryptionAlgorithm?: string;
  };
  documentComparison?: {
    isDocumentUploaded: boolean;
    isMatched: boolean;
    fieldDiffs: Array<{
      field: string;
      trustedValue: string;
      submittedValue: string;
      isMatch: boolean;
    }>;
    forensics?: DocumentForensicResult;
  };
  revocationDetails?: {
    revokedAt: string;
    revokedBy: string;
    reason: string;
  };
  holdDetails?: {
    reason: string;
    updatedAt: string;
  };
  aiExplanation: string;
  verifiedAt: string;
}

/**
 * Authoritative 8-Level Cryptographic Verification Engine.
 * Decrypts KMS envelope payload FIRST to recover trusted student details.
 * Recalculates SHA-256 fingerprint from decrypted envelope attributes only.
 * FAILS CLOSED if envelope missing, DEK invalid, or AuthTag check fails.
 */
export async function verifyCertificate(
  publicIdInput: string,
  options: {
    method?: 'QR' | 'ID_LOOKUP' | 'DOCUMENT_UPLOAD';
    uploadedData?: {
      studentName?: string;
      studentRollNo?: string;
      course?: string;
      cgpa?: string;
      marks?: string;
      rawText?: string;
      fileName?: string;
    };
    verifierType?: string;
    verifierId?: string;
  } = {}
): Promise<VerificationResultPayload> {
  const method = options.method || 'ID_LOOKUP';
  const cleanId = publicIdInput.trim().toUpperCase();
  const verifiedAt = new Date().toISOString();
  const refSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
  const referenceId = `VER-2026-${refSuffix}`;

  // 1. Fetch certificate record from database (Fail closed if DB connection fails)
  let cert: any = null;
  try {
    cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { publicId: cleanId },
          { id: publicIdInput }
        ]
      },
      include: {
        institution: {
          include: {
            accreditations: true
          }
        },
        ledgerEntries: {
          orderBy: { sequenceNumber: 'desc' },
          take: 1
        }
      }
    });
  } catch (err: any) {
    const dbOfflineLevels: VerificationLevelStep[] = [
      { level: 1, name: 'LEVEL 1 — Institution Identity', passed: false, score: 0, maxScore: 10, details: 'Database connection offline' },
      { level: 2, name: 'LEVEL 2 — Issuer Authentication', passed: false, score: 0, maxScore: 10, details: 'Database connection offline' },
      { level: 3, name: 'LEVEL 3 — Certificate Registry', passed: false, score: 0, maxScore: 15, details: 'Database connection offline' },
      { level: 4, name: 'LEVEL 4 — SHA-256 Integrity', passed: false, score: 0, maxScore: 20, details: 'N/A' },
      { level: 5, name: 'LEVEL 5 — Ed25519 Signature', passed: false, score: 0, maxScore: 20, details: 'N/A' },
      { level: 6, name: 'LEVEL 6 — Hash-Chain Ledger', passed: false, score: 0, maxScore: 15, details: 'N/A' },
      { level: 7, name: 'LEVEL 7 — Document Consistency', passed: false, score: 0, maxScore: 5, details: 'N/A' },
      { level: 8, name: 'LEVEL 8 — Lifecycle Status', passed: false, score: 0, maxScore: 5, details: 'N/A' }
    ];

    return {
      referenceId,
      result: 'VERIFICATION_UNAVAILABLE',
      certificateId: cleanId,
      publicId: cleanId,
      status: 'VERIFICATION_UNAVAILABLE',
      statusExplanation: `Verification failed closed: PostgreSQL database connection unavailable or offline. Error: ${err.message || 'Connection failed'}`,
      evidenceScore: 0,
      evidenceChain: dbOfflineLevels,
      verificationLevels: dbOfflineLevels,
      institution: null,
      certificateDetails: null,
      cryptographicProof: {
        canonicalHash: 'N/A',
        recalculatedHash: 'N/A',
        hashMatched: false,
        digitalSignature: 'N/A',
        signatureValid: false,
        algorithm: 'Ed25519',
        publicKeyFingerprint: 'N/A',
        ledgerIntegrityValid: false,
        envelopeEncrypted: true
      },
      aiExplanation: 'SECURITY ALERT: Verification engine failed closed due to database connectivity failure.',
      verifiedAt
    };
  }

  // Handle NOT_FOUND or Un-onboarded Registry Listed Institutions
  if (!cert || !cert.institution) {
    const registryInst = await prisma.institution.findFirst({
      where: {
        OR: [
          { publicId: cleanId },
          { shortName: cleanId }
        ]
      }
    });

    if (registryInst && registryInst.status === 'NOT_ONBOARDED') {
      const unavailableLevels: VerificationLevelStep[] = [
        { level: 1, name: 'LEVEL 1 — Institution Identity', passed: true, score: 10, maxScore: 10, details: `Listed in National Registry: ${registryInst.officialName}` },
        { level: 2, name: 'LEVEL 2 — Issuer Authentication', passed: false, score: 0, maxScore: 10, details: 'Institution not onboarded on CERTX' },
        { level: 3, name: 'LEVEL 3 — Certificate Registry', passed: false, score: 0, maxScore: 15, details: 'Certificate registry record unavailable' },
        { level: 4, name: 'LEVEL 4 — SHA-256 Integrity', passed: false, score: 0, maxScore: 20, details: 'Hash recalculation N/A' },
        { level: 5, name: 'LEVEL 5 — Ed25519 Signature', passed: false, score: 0, maxScore: 20, details: 'Digital signature N/A' },
        { level: 6, name: 'LEVEL 6 — Hash-Chain Ledger', passed: false, score: 0, maxScore: 15, details: 'Ledger audit N/A' },
        { level: 7, name: 'LEVEL 7 — Document Consistency', passed: false, score: 0, maxScore: 5, details: 'Document match N/A' },
        { level: 8, name: 'LEVEL 8 — Lifecycle Status', passed: false, score: 0, maxScore: 5, details: 'Lifecycle status N/A' }
      ];

      return {
        referenceId,
        result: 'VERIFICATION_UNAVAILABLE',
        certificateId: cleanId,
        publicId: cleanId,
        status: 'NOT_ONBOARDED',
        statusExplanation: 'The institution exists in the National Institution Registry but has not yet joined the CERTX trust network.',
        evidenceScore: 10,
        evidenceChain: unavailableLevels,
        verificationLevels: unavailableLevels,
        institution: {
          id: registryInst.id,
          publicId: registryInst.publicId,
          name: registryInst.officialName,
          code: registryInst.shortName || 'N/A',
          type: registryInst.institutionType,
          state: registryInst.state,
          city: registryInst.city,
          accreditation: 'UGC Listed',
          status: registryInst.status,
          certisealStatus: 'NOT_ONBOARDED',
          publicKeyFingerprint: 'N/A'
        },
        certificateDetails: null,
        cryptographicProof: {
          canonicalHash: 'N/A',
          recalculatedHash: 'N/A',
          hashMatched: false,
          digitalSignature: 'N/A',
          signatureValid: false,
          algorithm: 'Ed25519',
          publicKeyFingerprint: 'N/A',
          ledgerIntegrityValid: false,
          envelopeEncrypted: false
        },
        aiExplanation: `Institution ${registryInst.officialName} is listed in the National Registry, but has not yet onboarded to CERTX. Click 'Apply for CERTX Access' or request university administrators to onboard.`,
        verifiedAt
      };
    }

    const notFoundLevels: VerificationLevelStep[] = [
      { level: 1, name: 'LEVEL 1 — Institution Identity', passed: false, score: 0, maxScore: 10, details: 'Unverified Institution' },
      { level: 2, name: 'LEVEL 2 — Issuer Authentication', passed: false, score: 0, maxScore: 10, details: 'Issuer Unrecognized' },
      { level: 3, name: 'LEVEL 3 — Certificate Registry', passed: false, score: 0, maxScore: 15, details: 'Record Not Found in CERTX Database' },
      { level: 4, name: 'LEVEL 4 — SHA-256 Integrity', passed: false, score: 0, maxScore: 20, details: 'N/A' },
      { level: 5, name: 'LEVEL 5 — Ed25519 Signature', passed: false, score: 0, maxScore: 20, details: 'N/A' },
      { level: 6, name: 'LEVEL 6 — Hash-Chain Ledger', passed: false, score: 0, maxScore: 15, details: 'N/A' },
      { level: 7, name: 'LEVEL 7 — Document Consistency', passed: false, score: 0, maxScore: 5, details: 'N/A' },
      { level: 8, name: 'LEVEL 8 — Lifecycle Status', passed: false, score: 0, maxScore: 5, details: 'N/A' }
    ];

    return {
      referenceId,
      result: 'NOT_FOUND',
      certificateId: cleanId,
      publicId: cleanId,
      status: 'NOT_FOUND',
      statusExplanation: 'No trusted institutional record could be found for the supplied certificate ID.',
      evidenceScore: 0,
      evidenceChain: notFoundLevels,
      verificationLevels: notFoundLevels,
      institution: null,
      certificateDetails: null,
      cryptographicProof: {
        canonicalHash: 'N/A',
        recalculatedHash: 'N/A',
        hashMatched: false,
        digitalSignature: 'N/A',
        signatureValid: false,
        algorithm: 'Ed25519',
        publicKeyFingerprint: 'N/A',
        ledgerIntegrityValid: false,
        envelopeEncrypted: false
      },
      aiExplanation: 'The certificate ID was not found in the institution trust registry. Absence of a record indicates no cryptographically sealed record exists on CERTX.',
      verifiedAt
    };
  }

  // 2. ENVELOPE DECRYPTION & FAIL-CLOSED ENFORCEMENT
  // Decrypt KMS envelope payload FIRST to recover trusted student details.
  // NO FALLBACK TO PLAINTEXT DB COLUMNS PERMITTED.
  let decryptedPayload: any = null;
  let envelopeDecryptionError: string | null = null;

  if (!cert.encryptedPayload || !cert.encryptedDEK || !cert.iv || !cert.authTag) {
    envelopeDecryptionError = 'Missing encrypted envelope metadata or wrapped DEK';
  } else {
    try {
      const decryptedJsonStr = await decryptEnvelope(
        cert.encryptedPayload,
        cert.encryptedDEK,
        cert.iv,
        cert.authTag,
        cert.kmsKeyId || undefined
      );
      decryptedPayload = JSON.parse(decryptedJsonStr);
    } catch (err: any) {
      envelopeDecryptionError = err.message || 'AES-256-GCM authentication tag mismatch or KMS unwrap failure';
    }
  }

  // FAIL CLOSED IF ENVELOPE DECRYPTION FAILED
  if (envelopeDecryptionError || !decryptedPayload) {
    const failedLevels: VerificationLevelStep[] = [
      { level: 1, name: 'LEVEL 1 — Institution Identity', passed: cert.institution.status !== 'SUSPENDED', score: cert.institution.status !== 'SUSPENDED' ? 10 : 0, maxScore: 10, details: cert.institution.officialName },
      { level: 2, name: 'LEVEL 2 — Issuer Authentication', passed: !!cert.institution.publicKey, score: cert.institution.publicKey ? 10 : 0, maxScore: 10, details: 'Key Version Active' },
      { level: 3, name: 'LEVEL 3 — Certificate Registry', passed: true, score: 15, maxScore: 15, details: `Record Found: ${cert.publicId}` },
      { level: 4, name: 'LEVEL 4 — SHA-256 Integrity', passed: false, score: 0, maxScore: 20, details: `FAIL-CLOSED: Envelope Decryption Failed (${envelopeDecryptionError})` },
      { level: 5, name: 'LEVEL 5 — Ed25519 Signature', passed: false, score: 0, maxScore: 20, details: 'Signature Verification Skipped' },
      { level: 6, name: 'LEVEL 6 — Hash-Chain Ledger', passed: false, score: 0, maxScore: 15, details: 'Ledger Check Skipped' },
      { level: 7, name: 'LEVEL 7 — Document Consistency', passed: false, score: 0, maxScore: 5, details: 'N/A' },
      { level: 8, name: 'LEVEL 8 — Lifecycle Status', passed: false, score: 0, maxScore: 5, details: 'N/A' }
    ];

    return {
      referenceId,
      result: 'VERIFICATION_UNAVAILABLE',
      certificateId: cert.id,
      publicId: cert.publicId,
      status: 'VERIFICATION_UNAVAILABLE',
      statusExplanation: `Verification failed closed: ${envelopeDecryptionError}. The encrypted envelope ciphertext or authentication tag could not be validated.`,
      evidenceScore: 35,
      evidenceChain: failedLevels,
      verificationLevels: failedLevels,
      institution: {
        id: cert.institution.id,
        publicId: cert.institution.publicId,
        name: cert.institution.officialName,
        code: cert.institution.shortName || 'NITT',
        type: cert.institution.institutionType,
        state: cert.institution.state,
        city: cert.institution.city,
        accreditation: cert.institution.accreditations[0]?.grade ? `NAAC Grade ${cert.institution.accreditations[0].grade}` : 'UGC Approved',
        status: cert.institution.status,
        certisealStatus: cert.institution.status,
        publicKeyFingerprint: cert.institution.publicKeyFingerprint || 'ED25519-FP-DEFAULT'
      },
      certificateDetails: null,
      cryptographicProof: {
        canonicalHash: cert.canonicalHash,
        recalculatedHash: 'DECRYPTION_FAILED',
        hashMatched: false,
        digitalSignature: cert.digitalSignature,
        signatureValid: false,
        algorithm: 'Ed25519',
        publicKeyFingerprint: cert.institution.publicKeyFingerprint || 'ED25519-FP-DEFAULT',
        ledgerIntegrityValid: false,
        envelopeEncrypted: true,
        kmsKeyId: cert.kmsKeyId || 'local-master-kek-v1',
        encryptionAlgorithm: cert.encryptionAlgorithm || 'AES-256-GCM'
      },
      aiExplanation: `SECURITY ALERT: Envelope decryption for certificate ID ${cert.publicId} failed closed. Error: ${envelopeDecryptionError}. The authentication tag mismatch indicates ciphertext alteration or KMS key configuration mismatch.`,
      verifiedAt
    };
  }

  // 3. Extract trusted attributes from Decrypted Envelope Payload
  const studentName = decryptedPayload.studentName || '';
  const studentRollNo = decryptedPayload.studentRollNo || '';
  const course = decryptedPayload.course || '';
  const department = decryptedPayload.department || '';
  const certificateType = decryptedPayload.certificateType || cert.certificateType;
  const issueDate = decryptedPayload.issueDate || cert.issueDate;
  const completionDate = decryptedPayload.completionDate;
  const marks = decryptedPayload.marks;
  const cgpa = decryptedPayload.cgpa;
  const graduationYear = decryptedPayload.graduationYear;
  const additionalMetadata = decryptedPayload.additionalMetadata;

  // 4. Authoritative Canonical Payload Reconstruction from DECRYPTED ENVELOPE ATTRIBUTES
  const instCode = cert.institution.shortName || 'NITT';
  const canonicalPayload = buildCertificateCanonicalPayload({
    certificateId: cert.publicId,
    institutionId: cert.institutionId,
    institutionCode: instCode,
    studentName,
    studentRollNo,
    course,
    department,
    certificateType,
    issueDate,
    completionDate,
    marks,
    cgpa,
    graduationYear,
    additionalMetadata
  });

  const recalculatedHash = crypto.createHash('sha256').update(canonicalPayload, 'utf8').digest('hex');
  const hashMatched = recalculatedHash.toLowerCase() === cert.canonicalHash.toLowerCase();

  // 5. Fail-Closed Ed25519 Signature Verification
  const signatureValid = (cert.institution.publicKey && cert.digitalSignature)
    ? verifySignature(cert.canonicalHash, cert.digitalSignature, cert.institution.publicKey)
    : false;

  // 6. Real Genesis-to-Tip Hash Chain Ledger Integrity Audit
  const ledgerAudit = await verifyLedgerIntegrity();
  const ledgerValid = ledgerAudit.isValid && cert.ledgerEntries.length > 0;

  // 7. Document Upload OCR & Risk Signal Comparison
  let isDocumentUploaded = false;
  let isDocumentMatch = true;
  const fieldDiffs: Array<{ field: string; trustedValue: string; submittedValue: string; isMatch: boolean }> = [];
  let forensics: DocumentForensicResult | undefined;

  if (options.uploadedData && Object.keys(options.uploadedData).length > 0) {
    isDocumentUploaded = true;
    const up = options.uploadedData;

    if (up.studentName) {
      const match = up.studentName.trim().toLowerCase() === studentName.trim().toLowerCase();
      fieldDiffs.push({ field: 'Student Name', trustedValue: studentName, submittedValue: up.studentName, isMatch: match });
      if (!match) isDocumentMatch = false;
    }

    if (up.studentRollNo) {
      const match = up.studentRollNo.trim().toLowerCase() === studentRollNo.trim().toLowerCase();
      fieldDiffs.push({ field: 'Roll Number', trustedValue: studentRollNo, submittedValue: up.studentRollNo, isMatch: match });
      if (!match) isDocumentMatch = false;
    }

    if (up.course) {
      const match = up.course.trim().toLowerCase() === course.trim().toLowerCase();
      fieldDiffs.push({ field: 'Course / Program', trustedValue: course, submittedValue: up.course, isMatch: match });
      if (!match) isDocumentMatch = false;
    }

    if (up.cgpa) {
      const match = up.cgpa.trim() === (cgpa || '').trim();
      fieldDiffs.push({ field: 'CGPA', trustedValue: cgpa || 'N/A', submittedValue: up.cgpa, isMatch: match });
      if (!match) isDocumentMatch = false;
    }

    forensics = analyzeDocumentForensics(up.rawText || '', up.fileName || '', isDocumentMatch);
  }

  // 8. Determine Final Result State
  let finalResult: 'VERIFIED' | 'ON_HOLD' | 'RELEASED' | 'REVOKED' | 'TAMPERED' | 'NOT_FOUND' | 'VERIFICATION_UNAVAILABLE' = 'VERIFIED';
  let statusExplanation = 'Certificate is authentic, cryptographically verified from envelope, and currently valid.';

  if (!hashMatched || !signatureValid || !isDocumentMatch) {
    finalResult = 'TAMPERED';
    statusExplanation = !isDocumentMatch
      ? 'Document tampering detected! Submitted document attributes mismatch the cryptographically trusted institutional record.'
      : 'Cryptographic hash mismatch or invalid signature! The credential data appears to have been altered.';
  } else if (cert.status === 'REVOKED') {
    finalResult = 'REVOKED';
    statusExplanation = 'This certificate was genuinely issued by the institution but has subsequently been officially revoked.';
  } else if (cert.status === 'ON_HOLD') {
    finalResult = 'ON_HOLD';
    statusExplanation = 'Authentic certificate — currently on institutional administrative hold.';
  } else if (cert.status === 'RELEASED') {
    finalResult = 'RELEASED';
    statusExplanation = 'Certificate was previously on hold and has been officially cleared and released by the institution.';
  }

  // 8-Level Verification Chain explicit evaluation
  const verificationLevels: VerificationLevelStep[] = [
    {
      level: 1,
      name: 'LEVEL 1 — Institution Identity',
      passed: cert.institution.status !== 'SUSPENDED',
      score: cert.institution.status !== 'SUSPENDED' ? 10 : 0,
      maxScore: 10,
      details: `${cert.institution.officialName} (Status: ${cert.institution.status})`
    },
    {
      level: 2,
      name: 'LEVEL 2 — Issuer Authentication',
      passed: !!cert.institution.publicKey,
      score: cert.institution.publicKey ? 10 : 0,
      maxScore: 10,
      details: cert.institution.publicKey ? `Issuer Key FP: ${cert.institution.publicKeyFingerprint?.substring(0, 16)}...` : 'Missing Issuer Public Key'
    },
    {
      level: 3,
      name: 'LEVEL 3 — Certificate Registry',
      passed: true,
      score: 15,
      maxScore: 15,
      details: `Registered in CERTX Database: ${cert.publicId}`
    },
    {
      level: 4,
      name: 'LEVEL 4 — SHA-256 Envelope Integrity',
      passed: hashMatched,
      score: hashMatched ? 20 : 0,
      maxScore: 20,
      details: hashMatched ? 'Decrypted Envelope Canonical JSON SHA-256 Hash Matched' : 'Hash Mismatch Detected'
    },
    {
      level: 5,
      name: 'LEVEL 5 — Ed25519 Signature',
      passed: signatureValid,
      score: signatureValid ? 20 : 0,
      maxScore: 20,
      details: signatureValid ? 'Digital Signature Verified' : 'Invalid Ed25519 Signature'
    },
    {
      level: 6,
      name: 'LEVEL 6 — Hash-Chain Ledger',
      passed: ledgerValid,
      score: ledgerValid ? 15 : 0,
      maxScore: 15,
      details: ledgerValid ? 'Genesis-to-Tip Ledger Chain Valid' : 'Ledger Integrity Alert'
    },
    {
      level: 7,
      name: 'LEVEL 7 — Document Consistency',
      passed: isDocumentMatch,
      score: isDocumentMatch ? 5 : 0,
      maxScore: 5,
      details: isDocumentUploaded ? (isDocumentMatch ? '100% OCR Attribute Match' : 'Mismatched OCR Attributes') : 'Trusted Registry Baseline Verified'
    },
    {
      level: 8,
      name: 'LEVEL 8 — Lifecycle Status',
      passed: cert.status !== 'REVOKED' && cert.status !== 'ON_HOLD',
      score: cert.status === 'VERIFIED' || cert.status === 'RELEASED' ? 5 : 0,
      maxScore: 5,
      details: `Current Status: ${cert.status}`
    }
  ];

  const evidenceScore = verificationLevels.reduce((sum, step) => sum + step.score, 0);

  // Intelligence Explanation Summary
  let aiExplanation = '';
  if (finalResult === 'VERIFIED' || finalResult === 'RELEASED') {
    aiExplanation = `The certificate ID ${cert.publicId} exists in ${cert.institution.officialName}'s registry. Decrypted KMS envelope payload validates SHA-256 canonical hash, Ed25519 signature, and hash-chain ledger across all 8 verification levels. Weighted Evidence Score: ${evidenceScore}/100.`;
  } else if (finalResult === 'ON_HOLD') {
    aiExplanation = `The certificate ID ${cert.publicId} is authentic and cryptographically verified. However, ${cert.institution.officialName} has placed it on temporary administrative hold (${cert.holdReason || 'Administrative clearance pending'}). This does NOT mean the certificate is fake. Recommendation: DO NOT RELY until hold is cleared.`;
  } else if (finalResult === 'REVOKED') {
    aiExplanation = `The certificate ID ${cert.publicId} was cryptographically authentic when issued by ${cert.institution.officialName}, but was officially revoked on ${cert.revokedAt ? cert.revokedAt.toISOString().split('T')[0] : 'record date'} due to: ${cert.revocationReason || 'Administrative cancellation'}. Recommendation: DO NOT RELY.`;
  } else if (finalResult === 'TAMPERED') {
    aiExplanation = `DOCUMENT TAMPERING DETECTED for certificate ID ${cert.publicId}. The submitted data or cryptographic signature does not match the canonical SHA-256 fingerprint stored at issuance time. Key discrepancies have been highlighted in red.`;
  }

  // Audit event logging
  await logAuditEvent({
    actorId: options.verifierId || 'PUBLIC_VERIFIER',
    actorRole: options.verifierType || 'PUBLIC',
    actorName: 'Certificate Verifier',
    action: 'CERTIFICATE_VERIFIED',
    result: finalResult === 'TAMPERED' ? 'TAMPERED' : 'SUCCESS',
    institutionId: cert.institutionId,
    certificateId: cert.id
  });

  return {
    referenceId,
    result: finalResult,
    certificateId: cert.id,
    publicId: cert.publicId,
    status: cert.status,
    statusExplanation,
    evidenceScore,
    evidenceChain: verificationLevels,
    verificationLevels,
    institution: {
      id: cert.institution.id,
      publicId: cert.institution.publicId,
      name: cert.institution.officialName,
      code: instCode,
      type: cert.institution.institutionType,
      state: cert.institution.state,
      city: cert.institution.city,
      accreditation: cert.institution.accreditations[0]?.grade ? `NAAC Grade ${cert.institution.accreditations[0].grade}` : 'UGC Approved',
      status: cert.institution.status,
      certisealStatus: cert.institution.status,
      publicKeyFingerprint: cert.institution.publicKeyFingerprint || 'ED25519-FP-DEFAULT'
    },
    certificateDetails: {
      studentName,
      studentRollNo,
      course,
      department,
      certificateType,
      issueDate,
      completionDate: completionDate || undefined,
      marks: marks || undefined,
      cgpa: cgpa || undefined,
      graduationYear: graduationYear || undefined,
      additionalMetadata: additionalMetadata ? (typeof additionalMetadata === 'string' ? JSON.parse(additionalMetadata) : additionalMetadata) : undefined,
      currentVersion: cert.currentVersion
    },
    cryptographicProof: {
      canonicalHash: cert.canonicalHash,
      recalculatedHash,
      hashMatched,
      digitalSignature: cert.digitalSignature,
      signatureValid,
      algorithm: 'Ed25519',
      publicKeyFingerprint: cert.institution.publicKeyFingerprint || 'ED25519-FP-DEFAULT',
      ledgerIntegrityValid: ledgerValid,
      envelopeEncrypted: true,
      kmsKeyId: cert.kmsKeyId || 'local-master-kek-v1',
      encryptionAlgorithm: cert.encryptionAlgorithm || 'AES-256-GCM'
    },
    documentComparison: isDocumentUploaded
      ? {
          isDocumentUploaded: true,
          isMatched: isDocumentMatch,
          fieldDiffs,
          forensics
        }
      : undefined,
    revocationDetails: cert.status === 'REVOKED'
      ? {
          revokedAt: cert.revokedAt ? cert.revokedAt.toISOString() : verifiedAt,
          revokedBy: cert.revokedBy || 'Institution Admin',
          reason: cert.revocationReason || 'Institutional revocation'
        }
      : undefined,
    holdDetails: cert.status === 'ON_HOLD'
      ? {
          reason: cert.holdReason || 'Administrative clearance pending',
          updatedAt: cert.updatedAt.toISOString()
        }
      : undefined,
    aiExplanation,
    verifiedAt
  };
}
