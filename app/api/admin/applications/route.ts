import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';
import { logAuditEvent } from '@/lib/services/audit-service';
import { generateInstitutionKeyPair } from '@/lib/crypto/signatures';
import { encryptField } from '@/lib/crypto/encryption';
import { hashPassword } from '@/lib/auth/password';

export async function GET(req: Request) {
  try {
    const session = await requireRole(req, ['SUPER_ADMIN']);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const applications = await prisma.accessApplication.findMany({
      where,
      orderBy: { submittedAt: 'desc' }
    });

    return NextResponse.json({ applications });
  } catch (error: any) {
    const status = error.message?.includes('UNAUTHORIZED') ? 401 : error.message?.includes('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireRole(req, ['SUPER_ADMIN']);
    const body = await req.json();
    const { id, action, reviewNotes } = body || {};

    if (!id || !action || !['APPROVE', 'REJECT', 'REQUEST_INFO'].includes(action)) {
      return NextResponse.json(
        { error: 'Application ID and valid action (APPROVE, REJECT, REQUEST_INFO) are required.' },
        { status: 400 }
      );
    }

    const appRecord = await prisma.accessApplication.findUnique({
      where: { id }
    });

    if (!appRecord) {
      return NextResponse.json({ error: 'Access application not found.' }, { status: 404 });
    }

    let targetStatus = 'PENDING';
    if (action === 'APPROVE') targetStatus = 'APPROVED';
    if (action === 'REJECT') targetStatus = 'REJECTED';
    if (action === 'REQUEST_INFO') targetStatus = 'ADDITIONAL_INFO_REQUIRED';

    const updatedApp = await prisma.accessApplication.update({
      where: { id },
      data: {
        status: targetStatus,
        reviewedAt: new Date(),
        reviewedBy: session.name,
        reviewNotes: reviewNotes || (action === 'APPROVE' ? 'Application verified and approved for CERTX Platform access.' : 'Reviewed by Super Admin.')
      }
    });

    let createdOrg = null;
    let provisionedUser = null;

    // If APPROVED, create or activate Institution & provision Institution Admin user
    if (action === 'APPROVE') {
      const publicId = `INST-${appRecord.state.substring(0, 2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const normalizedName = appRecord.organizationName.toLowerCase().replace(/[^a-z0-9]/g, '');

      let inst = await prisma.institution.findFirst({
        where: {
          OR: [
            { officialName: appRecord.organizationName },
            { officialEmail: appRecord.officialEmail }
          ]
        }
      });

      if (!inst) {
        const keyPair = generateInstitutionKeyPair();
        const encryptedKeyCiphertext = encryptField(keyPair.privateKeyPem);

        inst = await prisma.institution.create({
          data: {
            publicId,
            officialName: appRecord.organizationName,
            normalizedName,
            shortName: appRecord.organizationName.substring(0, 6).toUpperCase(),
            aisheCode: appRecord.institutionOrOrgId || null,
            institutionType: appRecord.organizationType,
            officialWebsite: appRecord.officialWebsite || 'https://example.edu.in',
            officialEmail: appRecord.officialEmail,
            officialPhone: appRecord.phone,
            address: appRecord.address || `${appRecord.city}, ${appRecord.state}`,
            city: appRecord.city,
            district: appRecord.district,
            state: appRecord.state,
            postalCode: '600001',
            status: 'PARTICIPATING',
            publicKey: keyPair.publicKeyPem,
            publicKeyFingerprint: keyPair.publicKeyFingerprint,
            keyVersion: 1,
            keys: {
              create: {
                keyVersion: 1,
                publicKey: keyPair.publicKeyPem,
                publicKeyFingerprint: keyPair.publicKeyFingerprint,
                encryptedPrivateKey: encryptedKeyCiphertext,
                status: 'ACTIVE'
              }
            }
          }
        });
      } else {
        inst = await prisma.institution.update({
          where: { id: inst.id },
          data: { status: 'PARTICIPATING' }
        });
      }

      createdOrg = inst;

      // Provision initial Institution Admin user if not exists
      const existingUser = await prisma.user.findUnique({
        where: { email: appRecord.officialEmail }
      });

      if (!existingUser) {
        const passwordHash = await hashPassword('SIH2026MasterPass!');
        provisionedUser = await prisma.user.create({
          data: {
            name: appRecord.contactPerson,
            email: appRecord.officialEmail,
            passwordHash,
            role: 'INSTITUTION_ADMIN',
            institutionId: inst.id
          }
        });
      } else {
        provisionedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: { institutionId: inst.id, role: 'INSTITUTION_ADMIN' }
        });
      }
    }

    await logAuditEvent({
      actorId: session.id,
      actorRole: session.role,
      actorName: session.name,
      action: `ACCESS_APPLICATION_${action}`,
      result: 'SUCCESS',
      institutionId: createdOrg?.id || undefined,
      certificateId: appRecord.applicationId
    });

    return NextResponse.json({
      success: true,
      application: updatedApp,
      organization: createdOrg,
      provisionedUser: provisionedUser ? { email: provisionedUser.email, role: provisionedUser.role } : null
    });
  } catch (error: any) {
    const status = error.message?.includes('UNAUTHORIZED') ? 401 : error.message?.includes('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
