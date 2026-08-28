import { NextResponse } from 'next/server';
import { verifyCertificate } from '@/lib/services/verification-service';
import { generateVerificationReportHTML } from '@/lib/services/pdf-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const certId = searchParams.get('certificateId');

    if (!certId) {
      return NextResponse.json({ error: 'Certificate ID required' }, { status: 400 });
    }

    const verificationPayload = await verifyCertificate(certId, { method: 'ID_LOOKUP' });
    const html = generateVerificationReportHTML(verificationPayload);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="CERTISEAL_Verification_Report_${verificationPayload.referenceId}.html"`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
