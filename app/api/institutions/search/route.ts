import { NextResponse } from 'next/server';
import { searchNationalRegistry } from '@/lib/services/institution-registry-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || undefined;
    const state = searchParams.get('state') || undefined;
    const city = searchParams.get('city') || undefined;
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;

    const result = await searchNationalRegistry({
      query,
      state,
      city,
      type,
      status
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
