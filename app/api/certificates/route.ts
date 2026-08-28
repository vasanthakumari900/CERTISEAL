import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCertificateHash } from '@/lib/crypto/hashing';
import { buildCertificateCanonicalPayload } from '@/lib/crypto/canonical';
import { signFingerprint, generateInstitutionKeyPair } from '@/lib/crypto/signatures';
import { encryptField, decryptField } from '@/lib/crypto/encryption';
import { appendLedgerEntry } from '@/lib/services/ledger-service';
import { logAuditEvent } from '@/lib/services/audit-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const query = searchParams.get('query');
    const institutionId = searchParams.get('institutionId');

    const whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }
    if (type && type !== 'ALL') {
      whereClause.certificateType = type;
    }
    if (institutionId) {
      whereClause.institutionId = institutionId;
    }

    if (query) {
      whereClause.OR = [
        { publicId: { contains: query } },
        { studentName: { contains: query } },
        { studentRollNo: { contains: query } },
        { course: { contains: query } }
      ];
    }

    const certificates = await prisma.certificate.findMany({
      where: whereClause,
      include: {
        institution: {
          select: { officialName: true, shortName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ certificates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      institutionId,
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
      additionalMetadata,
      actorId
    } = body;

    let publicId = body.publicId ? body.publicId.trim().toUpperCase() : '';
    if (!publicId) {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      publicId = `CERT-${year}-${randomNum}`;
    }

    const existing = await prisma.certificate.findUnique({
      where: { publicId }
    });

    if (existing) {
      await logAuditEvent({
        actorId: actorId || 'INST_ADMIN',
        actorRole: 'INSTITUTION_ADMIN',
        actorName: 'Institution Admin',
        action: 'DUPLICATE_CERTIFICATE_ATTEMPT',
        result: 'FAILURE',
        institutionId,
        certificateId: publicId
      });

      return NextResponse.json(
        { error: `Certificate ID ${publicId} already exists in the trust registry! Replay attempt blocked.` },
        { status: 400 }
      );
    }

    let instKey = await prisma.institutionKey.findFirst({
      where: { institutionId, status: 'ACTIVE' }
    });

    if (!instKey) {
      const newKeyPair = generateInstitutionKeyPair();
      // Store encrypted private key in database with AES-256-GCM
      const encryptedKeyCiphertext = encryptField(newKeyPair.privateKeyPem);

      instKey = await prisma.institutionKey.create({
        data: {
          institutionId,
          keyVersion: 1,
          publicKey: newKeyPair.publicKeyPem,
          publicKeyFingerprint: newKeyPair.publicKeyFingerprint,
          encryptedPrivateKey: encryptedKeyCiphertext,
          status: 'ACTIVE'
        }
      });
    }

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId }
    });

    if (!institution || (institution.status !== 'PARTICIPATING' && institution.status !== 'ACTIVE')) {
      return NextResponse.json(
        { error: 'Only PARTICIPATING institutions are authorized to issue cryptographically signed certificates.' },
        { status: 403 }
      );
    }

    const sensitivePayload = JSON.stringify({ studentName, studentRollNo });
    const encryptedStudentData = encryptField(sensitivePayload);

    const instCode = institution.shortName || 'NITT';
    
    // Authoritative 14-field canonical payload reconstruction
    const canonicalPayload = buildCertificateCanonicalPayload({
      certificateId: publicId,
      institutionId,
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
      additionalMetadata: additionalMetadata ? JSON.stringify(additionalMetadata) : null
    });

    const canonicalHash = require('crypto').createHash('sha256').update(canonicalPayload, 'utf8').digest('hex');

    // Decrypt private key server-side in memory ONLY for signing
    let privateKeyPem = instKey.encryptedPrivateKey;
    if (privateKeyPem.includes('ciphertext')) {
      privateKeyPem = decryptField(privateKeyPem);
    }

    const digitalSignature = signFingerprint(canonicalHash, privateKeyPem);

    const certificate = await prisma.certificate.create({
      data: {
        publicId,
        institutionId,
        studentName,
        studentRollNo,
        encryptedStudentData,
        course,
        department,
        certificateType,
        issueDate,
        completionDate,
        marks,
        cgpa,
        graduationYear,
        additionalMetadata: additionalMetadata ? JSON.stringify(additionalMetadata) : null,
        canonicalHash,
        digitalSignature,
        keyVersion: instKey.keyVersion,
        status: 'VERIFIED',
        currentVersion: 1
      }
    });

    await prisma.certificateVersion.create({
      data: {
        certificateId: certificate.id,
        version: 1,
        canonicalHash,
        digitalSignature,
        changedBy: actorId || 'FACULTY_ISSUER',
        changeReason: 'Initial Cryptographic Issuance',
        snapshotData: canonicalPayload
      }
    });

    await appendLedgerEntry({
      certificateId: certificate.id,
      institutionId,
      operation: 'ISSUANCE',
      actorId: actorId || 'FACULTY_ISSUER',
      signatureRef: digitalSignature.substring(0, 32)
    });

    await logAuditEvent({
      actorId: actorId || 'FACULTY_ISSUER',
      actorRole: 'FACULTY',
      actorName: 'Authorized Issuer',
      action: 'CERTIFICATE_CREATED',
      result: 'SUCCESS',
      institutionId,
      certificateId: publicId
    });

    return NextResponse.json({
      success: true,
      certificate,
      cryptographicSeal: {
        canonicalHash,
        digitalSignature,
        publicKeyFingerprint: instKey.publicKeyFingerprint
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Issuance failed' }, { status: 500 });
  }
}
