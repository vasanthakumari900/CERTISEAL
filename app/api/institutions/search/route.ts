import { NextResponse } from 'next/server';
import { searchNationalRegistry } from '@/lib/services/institution-registry-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || undefined;
    const state = searchParams.get('state') || undefined;
    const district = searchParams.get('district') || undefined;
    const city = searchParams.get('city') || undefined;
    const type = searchParams.get('type') || undefined;
    const management = searchParams.get('management') || undefined;
    const source = searchParams.get('source') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 12;

    const result = await searchNationalRegistry({
      query,
      state,
      district,
      city,
      type,
      management,
      source,
      status,
      page,
      limit
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error searching institution directory' }, { status: 500 });
  }
}
