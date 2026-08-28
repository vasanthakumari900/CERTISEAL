import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateInstitutionKeyPair } from '@/lib/crypto/signatures';

const prisma = new PrismaClient();

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
    const body = await req.json();
    const { name, code, accreditation, address, contactEmail, website, status } = body;

    const shortCode = code || 'INST';
    const existing = await prisma.institution.findFirst({ where: { shortName: shortCode } });
    if (existing) {
      return NextResponse.json({ error: `Institution shortName '${shortCode}' already exists.` }, { status: 400 });
    }

    const keyPair = generateInstitutionKeyPair();
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
            encryptedPrivateKey: keyPair.privateKeyPem,
            status: 'ACTIVE'
          }
        }
      }
    });

    return NextResponse.json({ success: true, institution });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
