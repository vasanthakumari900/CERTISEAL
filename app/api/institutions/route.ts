import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';
import { generateInstitutionKeyPair } from '@/lib/crypto/signatures';
import { encryptField } from '@/lib/crypto/encryption';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const institutions = await prisma.institution.findMany({
      where: whereClause,
      include: {
        _count: { select: { certificates: true } }
      },
      orderBy: { officialName: 'asc' }
    });

    return NextResponse.json({ institutions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Enforce Server-Side Super Admin Authorization
    const session = await requireRole(req, ['SUPER_ADMIN']);

    const body = await req.json();
    const { name, code, accreditation, address, contactEmail, website, status } = body;

    const shortCode = code || 'INST';
    const existing = await prisma.institution.findFirst({ where: { shortName: shortCode } });
    if (existing) {
      return NextResponse.json({ error: `Institution shortName '${shortCode}' already exists.` }, { status: 400 });
    }

    const keyPair = generateInstitutionKeyPair();
    const encryptedKeyCiphertext = encryptField(keyPair.privateKeyPem);
    const publicId = `INST-IN-${Math.floor(100000 + Math.random() * 900000)}`;

    const institution = await prisma.institution.create({
      data: {
        publicId,
        officialName: name,
        normalizedName: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        shortName: shortCode,
        institutionType: 'University',
        officialWebsite: website || 'https://education.gov.in',
        officialEmail: contactEmail || 'info@inst.edu.in',
        address: address || 'Education Hub, India',
        city: 'New Delhi',
        district: 'Central',
        state: 'Delhi',
        postalCode: '110001',
        status: status || 'PARTICIPATING',
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

    return NextResponse.json({ success: true, institution });
  } catch (error: any) {
    const statusCode = error.message?.includes('UNAUTHORIZED') ? 401 : error.message?.includes('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Server error' }, { status: statusCode });
  }
}
