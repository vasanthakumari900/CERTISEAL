import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole, getSession } from '@/lib/auth/session';
import { generateCertificateHash } from '@/lib/crypto/hashing';
import { buildCertificateCanonicalPayload } from '@/lib/crypto/canonical';
import { signFingerprint, generateInstitutionKeyPair } from '@/lib/crypto/signatures';
import { encryptField, decryptField } from '@/lib/crypto/encryption';
import { appendLedgerEntry } from '@/lib/services/ledger-service';
import { logAuditEvent } from '@/lib/services/audit-service';
import { CertificateIssuanceSchema } from '@/lib/validation/schemas';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const query = searchParams.get('query');
    const institutionIdParam = searchParams.get('institutionId');

    const whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }
    if (type && type !== 'ALL') {
      whereClause.certificateType = type;
    }
    if (institutionIdParam) {
      whereClause.institutionId = institutionIdParam;
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
    // 1. Enforce Server-Side Authentication & Role Permissions
    const session = await requireRole(req, ['FACULTY', 'INSTITUTION_ADMIN', 'SUPER_ADMIN']);

    const body = await req.json();

    // 2. Validate input schema
    const validated = CertificateIssuanceSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid certificate issuance payload.', details: validated.error.format() },
        { status: 400 }
      );
    }

    const {
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
    } = validated.data;

    // 3. Enforce Server-Derived Institution Ownership
    let targetInstitutionId = session.institutionId;

    if (session.role === 'SUPER_ADMIN' && body.institutionId) {
      targetInstitutionId = body.institutionId; // Super Admin override
    }

    let institution = null;
    if (targetInstitutionId) {
      institution = await prisma.institution.findFirst({
        where: {
          OR: [
            { id: targetInstitutionId },
            { publicId: targetInstitutionId },
            { shortName: targetInstitutionId }
          ]
        }
      });
    }

    if (!institution) {
      institution = await prisma.institution.findFirst({
        where: { status: 'PARTICIPATING' }
      });
    }

    if (!institution) {
      return NextResponse.json(
        { error: 'FORBIDDEN: User account is not associated with an authorized issuing institution.' },
        { status: 403 }
      );
    }

    targetInstitutionId = institution.id;

    let publicId = body.publicId ? body.publicId.trim().toUpperCase() : '';
    if (!publicId) {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      publicId = `CERT-${year}-${randomNum}`;
    }

    // 4. Duplicate ID check (Replay Prevention)
    const existing = await prisma.certificate.findUnique({
      where: { publicId }
    });

    if (existing) {
      await logAuditEvent({
        actorId: session.id,
        actorRole: session.role,
        actorName: session.name,
        action: 'DUPLICATE_CERTIFICATE_ATTEMPT',
        result: 'FAILURE',
        institutionId: targetInstitutionId,
        certificateId: publicId
      });

      return NextResponse.json(
        { error: `Certificate ID ${publicId} already exists in the trust registry! Replay attempt blocked.` },
        { status: 400 }
      );
    }

    let instKey = await prisma.institutionKey.findFirst({
      where: { institutionId: targetInstitutionId, status: 'ACTIVE' }
    });

    if (!instKey) {
      const newKeyPair = generateInstitutionKeyPair();
      const encryptedKeyCiphertext = encryptField(newKeyPair.privateKeyPem);

      instKey = await prisma.institutionKey.create({
        data: {
          institutionId: targetInstitutionId,
          keyVersion: 1,
          publicKey: newKeyPair.publicKeyPem,
          publicKeyFingerprint: newKeyPair.publicKeyFingerprint,
          encryptedPrivateKey: encryptedKeyCiphertext,
          status: 'ACTIVE'
        }
      });
    }

    if (!institution || (institution.status !== 'PARTICIPATING' && institution.status !== 'ACTIVE' && institution.status !== 'VERIFIED')) {
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
      institutionId: targetInstitutionId,
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
        institutionId: targetInstitutionId,
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
        changedBy: session.id,
        changeReason: 'Initial Cryptographic Issuance',
        snapshotData: canonicalPayload
      }
    });

    await appendLedgerEntry({
      certificateId: certificate.id,
      institutionId: targetInstitutionId,
      operation: 'ISSUANCE',
      actorId: session.id,
      signatureRef: digitalSignature.substring(0, 32)
    });

    await logAuditEvent({
      actorId: session.id,
      actorRole: session.role,
      actorName: session.name,
      action: 'CERTIFICATE_CREATED',
      result: 'SUCCESS',
      institutionId: targetInstitutionId,
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
    const status = error.message?.includes('UNAUTHORIZED') ? 401 : error.message?.includes('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Issuance failed' }, { status });
  }
}
