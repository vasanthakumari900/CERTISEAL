import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateCertificateHash } from '@/lib/crypto/hashing';
import { signFingerprint } from '@/lib/crypto/signatures';
import { appendLedgerEntry } from '@/lib/services/ledger-service';
import { logAuditEvent } from '@/lib/services/audit-service';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [{ publicId: id }, { id }]
      },
      include: {
        institution: true,
        versions: { orderBy: { version: 'desc' } },
        ledgerEntries: { orderBy: { timestamp: 'desc' } }
      }
    });

    if (!cert) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    return NextResponse.json({ certificate: cert });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();
    const { action, reason, actorId, updatedData } = body;

    const cert = await prisma.certificate.findFirst({
      where: { OR: [{ publicId: id }, { id }] },
      include: { institution: true }
    });

    if (!cert) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    if (action === 'HOLD') {
      const updated = await prisma.certificate.update({
        where: { id: cert.id },
        data: {
          status: 'ON_HOLD',
          holdReason: reason || 'Administrative clearance hold'
        }
      });

      await appendLedgerEntry({
        certificateId: cert.id,
        institutionId: cert.institutionId,
        operation: 'STATUS_HOLD',
        actorId: actorId || 'ADMIN',
        signatureRef: cert.digitalSignature.substring(0, 32)
      });

      await logAuditEvent({
        actorId: actorId || 'ADMIN',
        actorRole: 'INSTITUTION_ADMIN',
        actorName: 'Institution Admin',
        action: 'CERTIFICATE_ON_HOLD',
        result: 'SUCCESS',
        institutionId: cert.institutionId,
        certificateId: cert.publicId
      });

      return NextResponse.json({ success: true, certificate: updated });
    }

    if (action === 'RELEASE') {
      const updated = await prisma.certificate.update({
        where: { id: cert.id },
        data: {
          status: 'RELEASED',
          holdReason: null
        }
      });

      await appendLedgerEntry({
        certificateId: cert.id,
        institutionId: cert.institutionId,
        operation: 'STATUS_RELEASED',
        actorId: actorId || 'ADMIN',
        signatureRef: cert.digitalSignature.substring(0, 32)
      });

      await logAuditEvent({
        actorId: actorId || 'ADMIN',
        actorRole: 'INSTITUTION_ADMIN',
        actorName: 'Institution Admin',
        action: 'CERTIFICATE_RELEASED',
        result: 'SUCCESS',
        institutionId: cert.institutionId,
        certificateId: cert.publicId
      });

      return NextResponse.json({ success: true, certificate: updated });
    }

    if (action === 'REVOKE') {
      const updated = await prisma.certificate.update({
        where: { id: cert.id },
        data: {
          status: 'REVOKED',
          revocationReason: reason || 'Official institutional revocation',
          revokedBy: actorId || 'ADMIN',
          revokedAt: new Date()
        }
      });

      await appendLedgerEntry({
        certificateId: cert.id,
        institutionId: cert.institutionId,
        operation: 'REVOCATION',
        actorId: actorId || 'ADMIN',
        signatureRef: cert.digitalSignature.substring(0, 32)
      });

      await logAuditEvent({
        actorId: actorId || 'ADMIN',
        actorRole: 'INSTITUTION_ADMIN',
        actorName: 'Institution Admin',
        action: 'CERTIFICATE_REVOKED',
        result: 'SUCCESS',
        institutionId: cert.institutionId,
        certificateId: cert.publicId
      });

      return NextResponse.json({ success: true, certificate: updated });
    }

    if (action === 'UPDATE_VERSION' && updatedData) {
      const newVersionNum = cert.currentVersion + 1;
      const mergedData = {
        studentName: updatedData.studentName || cert.studentName,
        studentRollNo: updatedData.studentRollNo || cert.studentRollNo,
        course: updatedData.course || cert.course,
        department: updatedData.department || cert.department,
        certificateType: updatedData.certificateType || cert.certificateType,
        issueDate: updatedData.issueDate || cert.issueDate,
        cgpa: updatedData.cgpa !== undefined ? updatedData.cgpa : cert.cgpa
      };

      const instKey = await prisma.institutionKey.findFirst({
        where: { institutionId: cert.institutionId, status: 'ACTIVE' }
      });

      const instCode = cert.institution.shortName || 'NITD';
      const structuredPayload = {
        certificateId: cert.publicId,
        institutionCode: instCode,
        ...mergedData
      };

      const newHash = generateCertificateHash(structuredPayload);
      const newSignature = instKey
        ? signFingerprint(newHash, instKey.encryptedPrivateKey)
        : cert.digitalSignature;

      const updated = await prisma.certificate.update({
        where: { id: cert.id },
        data: {
          ...mergedData,
          canonicalHash: newHash,
          digitalSignature: newSignature,
          currentVersion: newVersionNum
        }
      });

      await prisma.certificateVersion.create({
        data: {
          certificateId: cert.id,
          version: newVersionNum,
          canonicalHash: newHash,
          digitalSignature: newSignature,
          changedBy: actorId || 'ADMIN',
          changeReason: reason || `Version ${newVersionNum} amendment`,
          snapshotData: JSON.stringify(structuredPayload)
        }
      });

      await appendLedgerEntry({
        certificateId: cert.id,
        institutionId: cert.institutionId,
        operation: 'VERSION_UPDATE',
        actorId: actorId || 'ADMIN',
        signatureRef: newSignature.substring(0, 32)
      });

      return NextResponse.json({ success: true, certificate: updated });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
