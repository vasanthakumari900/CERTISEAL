import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateInstitutionKeyPair } from '@/lib/crypto/signatures';
import { logAuditEvent } from '@/lib/services/audit-service';

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const institutionId = params.id;
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId }
    });

    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    const nextVersion = institution.keyVersion + 1;
    const newKeyPair = generateInstitutionKeyPair();

    // Mark active keys as ROTATED
    await prisma.institutionKey.updateMany({
      where: { institutionId, status: 'ACTIVE' },
      data: { status: 'ROTATED' }
    });

    // Create new keypair entry
    await prisma.institutionKey.create({
      data: {
        institutionId,
        keyVersion: nextVersion,
        publicKey: newKeyPair.publicKeyPem,
        publicKeyFingerprint: newKeyPair.publicKeyFingerprint,
        encryptedPrivateKey: newKeyPair.privateKeyPem,
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
      actorId: 'INST_ADMIN',
      actorRole: 'INSTITUTION_ADMIN',
      actorName: 'Institution Security Officer',
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
