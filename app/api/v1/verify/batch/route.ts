import { NextResponse } from 'next/server';
import { verifyCertificate } from '@/lib/services/verification-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { certificateIds } = body;

    if (!Array.isArray(certificateIds) || certificateIds.length === 0) {
      return NextResponse.json({ error: 'Array of certificateIds required' }, { status: 400 });
    }

    // Limit batch size to 50 for performance
    const targetIds = certificateIds.slice(0, 50);

    const results = await Promise.all(
      targetIds.map((id: string) => verifyCertificate(id, { method: 'ID_LOOKUP', verifierType: 'EMPLOYER_BATCH' }))
    );

    return NextResponse.json({
      batchSize: results.length,
      processedAt: new Date().toISOString(),
      results
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
