import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const session = await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause: any = {};
    if (session.role !== 'SUPER_ADMIN' && session.institutionId) {
      whereClause.institutionId = session.institutionId;
    } else if (searchParams.get('institutionId')) {
      whereClause.institutionId = searchParams.get('institutionId');
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    return NextResponse.json({ auditLogs });
  } catch (error: any) {
    const status = error.message?.includes('UNAUTHORIZED') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
