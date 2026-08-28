import { NextResponse } from 'next/server';
import { simulateDemoLedgerTampering, restoreDemoLedgerIntegrity } from '@/lib/services/ledger-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'SIMULATE' || action === 'CORRUPT_BLOCK_3') {
      const result = await simulateDemoLedgerTampering();
      return NextResponse.json({ message: 'Demo ledger block tampered for judge evaluation!', ...result });
    } else if (action === 'RESTORE' || action === 'RESTORE_LEDGER') {
      const result = await restoreDemoLedgerIntegrity();
      return NextResponse.json({ message: 'Ledger restored to pristine cryptographic state!', ...result });
    }

    return NextResponse.json({ error: 'Action must be SIMULATE or RESTORE' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
