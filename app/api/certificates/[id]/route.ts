import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth/session';
import { generateCertificateHash } from '@/lib/crypto/hashing';
import { buildCertificateCanonicalPayload } from '@/lib/crypto/canonical';
import { signFingerprint } from '@/lib/crypto/signatures';
import { decryptField, encryptEnvelope } from '@/lib/crypto/encryption';
import { appendLedgerEntry } from '@/lib/services/ledger-service';
import { logAuditEvent } from '@/lib/services/audit-service';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(req);
    const id = params.id;
    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [{ publicId: id }, { id }]
      },
      include: {
        institution: {
          select: {
            id: true,
            publicId: true,
            officialName: true,
            shortName: true,
            city: true,
            state: true,
            status: true
          }
        },
        versions: { orderBy: { version: 'desc' } },
        ledgerEntries: { orderBy: { sequenceNumber: 'desc' } }
      }
    });

    if (!cert) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    // Server-Side RBAC & Institution Ownership Check
    if (session.role !== 'SUPER_ADMIN' && session.institutionId !== cert.institutionId) {
      return NextResponse.json(
        { error: 'FORBIDDEN: You are not authorized to access protected credentials for another institution.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      certificate: {
        id: cert.id,
        publicId: cert.publicId,
        institutionId: cert.institutionId,
        certificateType: cert.certificateType,
        issueDate: cert.issueDate,
        status: cert.status,
        holdReason: cert.holdReason,
        revocationReason: cert.revocationReason,
        revokedBy: cert.revokedBy,
        revokedAt: cert.revokedAt,
        canonicalHash: cert.canonicalHash,
        digitalSignature: cert.digitalSignature,
        currentVersion: cert.currentVersion,
        kmsKeyId: cert.kmsKeyId,
        encryptionAlgorithm: cert.encryptionAlgorithm,
        institution: cert.institution,
        versions: cert.versions,
        ledgerEntries: cert.ledgerEntries
      }
    });
  } catch (error: any) {
    const status = error.message?.includes('UNAUTHORIZED') ? 401 : error.message?.includes('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Access denied' }, { status });
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

    if (action === 'HOLD' || action === 'PLACE_ON_HOLD') {
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

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    const status = error.message?.includes('UNAUTHORIZED') ? 401 : error.message?.includes('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status });
  }
}
