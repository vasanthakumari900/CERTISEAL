import { NextResponse } from 'next/server';
import { verifyLedgerIntegrity } from '@/lib/services/ledger-service';

export async function GET() {
  try {
    const report = await verifyLedgerIntegrity();
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
