import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { institutionId, requestedBy, companyName, reason } = body;

    if (!institutionId || !requestedBy) {
      return NextResponse.json({ error: 'institutionId and requestedBy are required' }, { status: 400 });
    }

    const requestObj = await prisma.institutionRequest.create({
      data: {
        institutionId,
        requestedBy,
        companyName: companyName || 'Recruitment Team',
        reason: reason || 'Employer requesting institution onboarding for candidate verification'
      }
    });

    return NextResponse.json({ success: true, requestObj });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
