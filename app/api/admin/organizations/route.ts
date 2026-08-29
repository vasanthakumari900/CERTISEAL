import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';
import { logAuditEvent } from '@/lib/services/audit-service';

export async function GET(req: Request) {
  try {
    const session = await requireRole(req, ['SUPER_ADMIN']);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const institutions = await prisma.institution.findMany({
      where,
      include: {
        _count: {
          select: {
            certificates: true,
            users: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ institutions });
  } catch (error: any) {
    const status = error.message?.includes('UNAUTHORIZED') ? 401 : error.message?.includes('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireRole(req, ['SUPER_ADMIN']);
    const body = await req.json();
    const { institutionId, targetStatus, reason } = body || {};

    if (!institutionId || !targetStatus || !['PARTICIPATING', 'VERIFIED', 'SUSPENDED', 'INACTIVE', 'REGISTRY_LISTED'].includes(targetStatus)) {
      return NextResponse.json(
        { error: 'Valid institutionId and targetStatus (PARTICIPATING, VERIFIED, SUSPENDED, INACTIVE, REGISTRY_LISTED) are required.' },
        { status: 400 }
      );
    }

    const updatedInst = await prisma.institution.update({
      where: { id: institutionId },
      data: { status: targetStatus }
    });

    await logAuditEvent({
      actorId: session.id,
      actorRole: session.role,
      actorName: session.name,
      action: `ORGANIZATION_STATUS_CHANGED_${targetStatus}`,
      result: 'SUCCESS',
      institutionId,
      certificateId: reason || `Status updated to ${targetStatus}`
    });

    return NextResponse.json({
      success: true,
      institution: updatedInst
    });
  } catch (error: any) {
    const status = error.message?.includes('UNAUTHORIZED') ? 401 : error.message?.includes('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
