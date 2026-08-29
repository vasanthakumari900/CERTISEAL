import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/services/audit-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      organizationName,
      organizationType,
      institutionOrOrgId,
      officialEmail,
      contactPerson,
      designation,
      phone,
      state,
      district,
      city,
      officialWebsite,
      address,
      reason,
      expectedUsers,
      expectedVolume,
      supportingDocs,
      declarationConsent
    } = body || {};

    if (!organizationName || !officialEmail || !contactPerson || !phone || !state || !city) {
      return NextResponse.json(
        { error: 'Missing required application fields: Organization name, official email, contact person, phone, state, and city are required.' },
        { status: 400 }
      );
    }

    if (!declarationConsent) {
      return NextResponse.json(
        { error: 'Declaration consent is required to submit an access application.' },
        { status: 400 }
      );
    }

    // Generate unique Application ID (e.g. CX-APP-2026-000001)
    const count = await prisma.accessApplication.count();
    const sequence = String(count + 1).padStart(6, '0');
    const applicationId = `CX-APP-${new Date().getFullYear()}-${sequence}`;

    const application = await prisma.accessApplication.create({
      data: {
        applicationId,
        organizationName: organizationName.trim(),
        organizationType: organizationType || 'University',
        institutionOrOrgId: institutionOrOrgId?.trim() || null,
        officialEmail: officialEmail.trim().toLowerCase(),
        contactPerson: contactPerson.trim(),
        designation: designation?.trim() || 'Administrator',
        phone: phone.trim(),
        state: state.trim(),
        district: district?.trim() || city.trim(),
        city: city.trim(),
        officialWebsite: officialWebsite?.trim() || '',
        address: address?.trim() || '',
        reason: reason?.trim() || 'Certificate issuance and verification onboarding',
        expectedUsers: expectedUsers || '10-50',
        expectedVolume: expectedVolume || '1,000 - 10,000/year',
        supportingDocs: supportingDocs?.trim() || null,
        declarationConsent: Boolean(declarationConsent),
        status: 'PENDING'
      }
    });

    await logAuditEvent({
      actorId: 'PUBLIC_APPLICANT',
      actorRole: 'APPLICANT',
      actorName: contactPerson,
      action: 'ACCESS_APPLICATION_SUBMITTED',
      result: 'SUCCESS',
      certificateId: applicationId
    });

    return NextResponse.json({
      success: true,
      applicationId: application.applicationId,
      status: 'PENDING REVIEW',
      message: 'Your CERTX access application has been submitted successfully and is currently under administrative review.',
      application
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit access application' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get('id');

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID parameter is required.' }, { status: 400 });
    }

    const application = await prisma.accessApplication.findUnique({
      where: { applicationId: applicationId.trim().toUpperCase() }
    });

    if (!application) {
      return NextResponse.json({ error: 'Access application record not found.' }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
