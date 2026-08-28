import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth/session';
import { generateCertificateHash } from '@/lib/crypto/hashing';
import { buildCertificateCanonicalPayload } from '@/lib/crypto/canonical';
import { signFingerprint } from '@/lib/crypto/signatures';
import { decryptField } from '@/lib/crypto/encryption';
import { appendLedgerEntry } from '@/lib/services/ledger-service';
import { logAuditEvent } from '@/lib/services/audit-service';

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
        ledgerEntries: { orderBy: { sequenceNumber: 'desc' } }
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
    // 1. Enforce Server-Side Authentication & Role Permissions
    const session = await requireRole(req, ['INSTITUTION_ADMIN', 'FACULTY', 'SUPER_ADMIN']);

    const id = params.id;
    const body = await req.json();
    const { action, reason, updatedData } = body;

    const cert = await prisma.certificate.findFirst({
      where: { OR: [{ publicId: id }, { id }] },
      include: { institution: true }
    });

    if (!cert) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    // 2. Enforce Institution Ownership Scoping
    if (session.role !== 'SUPER_ADMIN' && session.institutionId !== cert.institutionId) {
      return NextResponse.json(
        { error: 'FORBIDDEN: You are not authorized to manage credentials for another institution.' },
        { status: 403 }
      );
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
        actorId: session.id,
        signatureRef: cert.digitalSignature.substring(0, 32)
      });

      await logAuditEvent({
        actorId: session.id,
        actorRole: session.role,
        actorName: session.name,
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
        actorId: session.id,
        signatureRef: cert.digitalSignature.substring(0, 32)
      });

      await logAuditEvent({
        actorId: session.id,
        actorRole: session.role,
        actorName: session.name,
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
          revokedBy: session.id,
          revokedAt: new Date()
        }
      });

      await appendLedgerEntry({
        certificateId: cert.id,
        institutionId: cert.institutionId,
        operation: 'REVOCATION',
        actorId: session.id,
        signatureRef: cert.digitalSignature.substring(0, 32)
      });

      await logAuditEvent({
        actorId: session.id,
        actorRole: session.role,
        actorName: session.name,
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

      const instCode = cert.institution.shortName || 'NITT';
      const canonicalPayload = buildCertificateCanonicalPayload({
        certificateId: cert.publicId,
        institutionId: cert.institutionId,
        institutionCode: instCode,
        ...mergedData
      });

      const newHash = require('crypto').createHash('sha256').update(canonicalPayload, 'utf8').digest('hex');

      let newSignature = cert.digitalSignature;
      if (instKey) {
        let privateKeyPem = instKey.encryptedPrivateKey;
        if (privateKeyPem.includes('ciphertext')) {
          privateKeyPem = decryptField(privateKeyPem);
        }
        newSignature = signFingerprint(newHash, privateKeyPem);
      }

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
          changedBy: session.id,
          changeReason: reason || `Version ${newVersionNum} amendment`,
          snapshotData: canonicalPayload
        }
      });

      await appendLedgerEntry({
        certificateId: cert.id,
        institutionId: cert.institutionId,
        operation: 'VERSION_UPDATE',
        actorId: session.id,
        signatureRef: newSignature.substring(0, 32)
      });

      await logAuditEvent({
        actorId: session.id,
        actorRole: session.role,
        actorName: session.name,
        action: 'CERTIFICATE_UPDATED',
        result: 'SUCCESS',
        institutionId: cert.institutionId,
        certificateId: cert.publicId
      });

      return NextResponse.json({ success: true, certificate: updated });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    const status = error.message?.includes('UNAUTHORIZED') ? 401 : error.message?.includes('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status });
  }
}
