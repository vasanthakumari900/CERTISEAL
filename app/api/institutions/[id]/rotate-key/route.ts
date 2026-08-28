import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireInstitutionAccess } from '@/lib/auth/session';
import { generateInstitutionKeyPair } from '@/lib/crypto/signatures';
import { encryptField } from '@/lib/crypto/encryption';
import { logAuditEvent } from '@/lib/services/audit-service';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const institutionId = params.id;

    // 1. Enforce Server-Side Authentication & Institution Ownership Access
    const session = await requireInstitutionAccess(req, institutionId);

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId }
    });

    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    const nextVersion = institution.keyVersion + 1;
    const newKeyPair = generateInstitutionKeyPair();
    const encryptedKeyCiphertext = encryptField(newKeyPair.privateKeyPem);

    // Mark active keys as ROTATED
    await prisma.institutionKey.updateMany({
      where: { institutionId, status: 'ACTIVE' },
      data: { status: 'ROTATED' }
    });

    // Create new keypair entry with AES-256-GCM encrypted private key
    await prisma.institutionKey.create({
      data: {
        institutionId,
        keyVersion: nextVersion,
        publicKey: newKeyPair.publicKeyPem,
        publicKeyFingerprint: newKeyPair.publicKeyFingerprint,
        encryptedPrivateKey: encryptedKeyCiphertext,
        status: 'ACTIVE'
      }
    });

    // Update institution current active key metadata
    const updatedInst = await prisma.institution.update({
      where: { id: institutionId },
      data: {
        keyVersion: nextVersion,
        publicKey: newKeyPair.publicKeyPem,
        publicKeyFingerprint: newKeyPair.publicKeyFingerprint
      }
    });

    await logAuditEvent({
      actorId: session.id,
      actorRole: session.role,
      actorName: session.name,
      action: 'KEY_ROTATION',
      result: 'SUCCESS',
      institutionId
    });

    return NextResponse.json({
      success: true,
      institution: updatedInst,
      newKeyVersion: nextVersion,
      publicKeyFingerprint: newKeyPair.publicKeyFingerprint
    });
  } catch (error: any) {
    const status = error.message?.includes('UNAUTHORIZED') ? 401 : error.message?.includes('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Key rotation failed' }, { status });
  }
}
