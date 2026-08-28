import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateInstitutionKeyPair } from '@/lib/crypto/signatures';
import { encryptField } from '@/lib/crypto/encryption';
import { logAuditEvent } from '@/lib/services/audit-service';

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
