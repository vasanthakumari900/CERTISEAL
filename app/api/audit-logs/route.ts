import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const institutionId = searchParams.get('institutionId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause: any = {};
    if (institutionId) {
      whereClause.institutionId = institutionId;
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    return NextResponse.json({ auditLogs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
