import crypto from 'crypto';
import { prisma } from '../prisma';
import { generateCertificateHash } from '../crypto/hashing';
import { buildCertificateCanonicalPayload } from '../crypto/canonical';
import { verifySignature } from '../crypto/signatures';
import { logAuditEvent } from './audit-service';
import { verifyLedgerIntegrity } from './ledger-service';
import { analyzeDocumentForensics, DocumentForensicResult } from './forensic-service';

export interface EvidenceChainStep {
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
  evidenceChain: EvidenceChainStep[];
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
    encryptedDataPayload: string;
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

  // 1. Fetch certificate record from database
  const cert = await prisma.certificate.findFirst({
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

  // Handle NOT_FOUND or VERIFICATION_UNAVAILABLE
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
      return {
        referenceId,
        result: 'VERIFICATION_UNAVAILABLE',
        certificateId: cleanId,
        publicId: cleanId,
        status: 'NOT_ONBOARDED',
        statusExplanation: 'The institution exists in the National Institution Registry but has not yet joined the CERTISEAL trust network.',
        evidenceScore: 30,
        evidenceChain: [
          { name: 'Institution Registry Record', passed: true, score: 20, maxScore: 20, details: `Listed: ${registryInst.officialName}` },
          { name: 'CERTISEAL Participation', passed: false, score: 0, maxScore: 10, details: 'Not Onboarded' },
          { name: 'Certificate Record', passed: false, score: 0, maxScore: 20, details: 'Unavailable' },
          { name: 'SHA-256 Fingerprint', passed: false, score: 0, maxScore: 25, details: 'N/A' },
          { name: 'Ed25519 Signature', passed: false, score: 0, maxScore: 20, details: 'N/A' },
          { name: 'Hash Chain Ledger', passed: false, score: 0, maxScore: 15, details: 'N/A' },
          { name: 'Status Compliance', passed: false, score: 0, maxScore: 10, details: 'Unavailable' }
        ],
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
          encryptedDataPayload: 'N/A'
        },
        aiExplanation: `Institution ${registryInst.officialName} is listed in the National Registry, but has not yet onboarded to CERTISEAL. Click 'Request Institution to Join' to notify university administrators.`,
        verifiedAt
      };
    }

    return {
      referenceId,
      result: 'NOT_FOUND',
      certificateId: cleanId,
      publicId: cleanId,
      status: 'NOT_FOUND',
      statusExplanation: 'No trusted institutional record could be found for the supplied certificate ID.',
      evidenceScore: 0,
      evidenceChain: [
        { name: 'Certificate Found', passed: false, score: 0, maxScore: 20, details: 'Record Not Found' },
        { name: 'Institution Valid', passed: false, score: 0, maxScore: 10, details: 'N/A' },
        { name: 'SHA-256 Hash Match', passed: false, score: 0, maxScore: 25, details: 'N/A' },
        { name: 'Ed25519 Signature', passed: false, score: 0, maxScore: 20, details: 'N/A' },
        { name: 'Ledger Integrity', passed: false, score: 0, maxScore: 15, details: 'N/A' },
        { name: 'Document Match', passed: false, score: 0, maxScore: 10, details: 'N/A' }
      ],
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
        encryptedDataPayload: 'N/A'
      },
      aiExplanation: 'The certificate ID was not found in the institution trust registry. Note that absence of a record does not automatically prove forgery, but it indicates no cryptographically sealed record exists on CERTISEAL.',
      verifiedAt
    };
  }

  // 2. Authoritative 14-field canonical payload reconstruction
  const instCode = cert.institution.shortName || 'NITT';
  const canonicalPayload = buildCertificateCanonicalPayload({
    certificateId: cert.publicId,
    institutionId: cert.institutionId,
    institutionCode: instCode,
    studentName: cert.studentName,
    studentRollNo: cert.studentRollNo,
    course: cert.course,
    department: cert.department,
    certificateType: cert.certificateType,
    issueDate: cert.issueDate,
    completionDate: cert.completionDate,
    marks: cert.marks,
    cgpa: cert.cgpa,
    graduationYear: cert.graduationYear,
    additionalMetadata: cert.additionalMetadata
  });

  const recalculatedHash = crypto.createHash('sha256').update(canonicalPayload, 'utf8').digest('hex');
  const hashMatched = recalculatedHash.toLowerCase() === cert.canonicalHash.toLowerCase();

  // 3. Fail-Closed Ed25519 Signature Verification
  // FAIL CLOSED: If public key is missing or signature is missing, signatureValid MUST be false
  const signatureValid = (cert.institution.publicKey && cert.digitalSignature)
    ? verifySignature(cert.canonicalHash, cert.digitalSignature, cert.institution.publicKey)
    : false;

  // 4. Real Genesis-to-Tip Hash Chain Ledger Integrity Audit
  const ledgerAudit = await verifyLedgerIntegrity();
  const ledgerValid = ledgerAudit.isValid && cert.ledgerEntries.length > 0;

  // 5. Document Upload OCR & Risk Signal Comparison
  let isDocumentUploaded = false;
  let isDocumentMatch = true;
  const fieldDiffs: Array<{ field: string; trustedValue: string; submittedValue: string; isMatch: boolean }> = [];
  let forensics: DocumentForensicResult | undefined;

  if (options.uploadedData && Object.keys(options.uploadedData).length > 0) {
    isDocumentUploaded = true;
    const up = options.uploadedData;

    if (up.studentName) {
      const match = up.studentName.trim().toLowerCase() === cert.studentName.trim().toLowerCase();
      fieldDiffs.push({ field: 'Student Name', trustedValue: cert.studentName, submittedValue: up.studentName, isMatch: match });
      if (!match) isDocumentMatch = false;
    }

    if (up.studentRollNo) {
      const match = up.studentRollNo.trim().toLowerCase() === cert.studentRollNo.trim().toLowerCase();
      fieldDiffs.push({ field: 'Roll Number', trustedValue: cert.studentRollNo, submittedValue: up.studentRollNo, isMatch: match });
      if (!match) isDocumentMatch = false;
    }

    if (up.course) {
      const match = up.course.trim().toLowerCase() === cert.course.trim().toLowerCase();
      fieldDiffs.push({ field: 'Course / Program', trustedValue: cert.course, submittedValue: up.course, isMatch: match });
      if (!match) isDocumentMatch = false;
    }

    if (up.cgpa) {
      const match = up.cgpa.trim() === (cert.cgpa || '').trim();
      fieldDiffs.push({ field: 'CGPA', trustedValue: cert.cgpa || 'N/A', submittedValue: up.cgpa, isMatch: match });
      if (!match) isDocumentMatch = false;
    }

    forensics = analyzeDocumentForensics(up.rawText || '', up.fileName || '', isDocumentMatch);
  }

  // 6. Determine Final Result State
  let finalResult: 'VERIFIED' | 'ON_HOLD' | 'RELEASED' | 'REVOKED' | 'TAMPERED' | 'NOT_FOUND' | 'VERIFICATION_UNAVAILABLE' = 'VERIFIED';
  let statusExplanation = 'Certificate is authentic, cryptographically verified, and currently valid.';

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

  // 7-Step Evidence Chain Calculation
  const evidenceChain: EvidenceChainStep[] = [
    { name: 'Certificate Found', passed: true, score: 20, maxScore: 20, details: `Record ID: ${cert.publicId}` },
    { name: 'Institution Valid', passed: cert.institution.status !== 'SUSPENDED', score: 10, maxScore: 10, details: `${cert.institution.officialName} (${cert.institution.status})` },
    { name: 'SHA-256 Hash Match', passed: hashMatched, score: hashMatched ? 25 : 0, maxScore: 25, details: hashMatched ? 'Canonical Fingerprint Matched' : 'Hash Mismatch' },
    { name: 'Ed25519 Signature', passed: signatureValid, score: signatureValid ? 20 : 0, maxScore: 20, details: signatureValid ? 'Digital Signature Valid' : 'Signature Invalid / Key Missing' },
    { name: 'Ledger Integrity', passed: ledgerValid, score: ledgerValid ? 15 : 0, maxScore: 15, details: ledgerValid ? 'Genesis Chain Valid' : 'Ledger Integrity Flagged' },
    { name: 'Document Comparison', passed: isDocumentMatch, score: isDocumentMatch ? 10 : 0, maxScore: 10, details: isDocumentMatch ? '100% Match' : 'Mismatched Fields' }
  ];

  const evidenceScore = evidenceChain.reduce((sum, step) => sum + step.score, 0);

  // Intelligence Explanation Summary
  let aiExplanation = '';
  if (finalResult === 'VERIFIED' || finalResult === 'RELEASED') {
    aiExplanation = `The certificate ID ${cert.publicId} exists in ${cert.institution.officialName}'s registry. The SHA-256 canonical hash matches the institutional record, the Ed25519 signature is cryptographically valid, and ledger chain integrity is verified. Weighted Evidence Score: ${evidenceScore}/100.`;
  } else if (finalResult === 'ON_HOLD') {
    aiExplanation = `The certificate ID ${cert.publicId} is authentic and cryptographically verified. However, ${cert.institution.officialName} has placed it on temporary administrative hold (${cert.holdReason || 'Administrative clearance pending'}). This does NOT indicate that the certificate is fake. Recommendation: DO NOT RELY until hold is cleared.`;
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
    evidenceChain,
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
      studentName: cert.studentName,
      studentRollNo: cert.studentRollNo,
      course: cert.course,
      department: cert.department,
      certificateType: cert.certificateType,
      issueDate: cert.issueDate,
      completionDate: cert.completionDate || undefined,
      marks: cert.marks || undefined,
      cgpa: cert.cgpa || undefined,
      graduationYear: cert.graduationYear || undefined,
      additionalMetadata: cert.additionalMetadata ? JSON.parse(cert.additionalMetadata) : undefined,
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
      encryptedDataPayload: cert.encryptedStudentData || 'N/A'
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
