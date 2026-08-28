import { NextResponse } from 'next/server';
import { simulateDemoLedgerTampering, restoreDemoLedgerIntegrity } from '@/lib/services/ledger-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'SIMULATE') {
      const result = await simulateDemoLedgerTampering();
      return NextResponse.json(result);
    } else if (action === 'RESTORE') {
      const result = await restoreDemoLedgerIntegrity();
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Action must be SIMULATE or RESTORE' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
