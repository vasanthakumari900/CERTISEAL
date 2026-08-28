import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OnboardingRequestSchema } from '@/lib/validation/schemas';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validated = OnboardingRequestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid onboarding request format.', details: validated.error.format() },
        { status: 400 }
      );
    }

    const { officerName, officerDesignation, officialDomainEmail, institutionName, officialWebsite, documentationDetails } = validated.data;

    // Find or create candidate institution record in NOT_ONBOARDED status
    let inst = await prisma.institution.findFirst({
      where: {
        OR: [
          { officialName: institutionName },
          { officialEmail: officialDomainEmail }
        ]
      }
    });

    if (!inst) {
      const publicId = `INST-TN-${Math.floor(100000 + Math.random() * 900000)}`;
      const normalized = institutionName.toLowerCase().replace(/[^a-z0-9]/g, '');

      inst = await prisma.institution.create({
        data: {
          publicId,
          officialName: institutionName,
          normalizedName: normalized,
          institutionType: 'Autonomous College',
          officialWebsite: officialWebsite || 'https://institution.edu.in',
          officialEmail: officialDomainEmail,
          address: 'Campus Drive, Academic Zone',
          city: 'Chennai',
          district: 'Chennai',
          state: 'Tamil Nadu',
          postalCode: '600001',
          status: 'NOT_ONBOARDED'
        }
      });
    }

    // Create onboarding application record
    const onboarding = await prisma.institutionOnboarding.create({
      data: {
        institutionId: inst.id,
        officerName,
        officerDesignation: officerDesignation || 'Nodal Officer',
        officialDomainEmail,
        documentationDetails: documentationDetails || 'UGC & AISHE Accreditation Record Attached',
        status: 'SUBMITTED'
      }
    });

    // Record Security Alert for Super Admin notification
    await prisma.securityAlert.create({
      data: {
        severity: 'LOW',
        event: 'NEW_ONBOARDING_REQUEST',
        institutionId: inst.id,
        details: `Onboarding request received from ${officerName} (${officialDomainEmail}) for ${institutionName}`,
        status: 'OPEN'
      }
    });

    return NextResponse.json({
      success: true,
      id: onboarding.id,
      institutionId: inst.id,
      institutionName: inst.officialName,
      status: onboarding.status
    });
  } catch (err: any) {
    console.error('Onboarding API Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
