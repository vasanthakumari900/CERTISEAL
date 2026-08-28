import { NextResponse } from 'next/server';
import { verifyCertificate } from '@/lib/services/verification-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { certificateId, method, uploadedData, verifierType, verifierId } = body;

    if (!certificateId) {
      return NextResponse.json({ error: 'Certificate ID is required' }, { status: 400 });
    }

    const result = await verifyCertificate(certificateId, {
      method: method || 'ID_LOOKUP',
      uploadedData,
      verifierType,
      verifierId
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Verification service error' }, { status: 500 });
  }
}
