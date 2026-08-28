import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const alerts = await prisma.securityAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({ alerts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
