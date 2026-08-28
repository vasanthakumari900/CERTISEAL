import { prisma } from '../prisma';
import { generateAuditHash } from '../crypto/hashing';

export async function logAuditEvent(params: {
  actorId: string;
  actorRole: string;
  actorName: string;
  action: string;
  result: 'SUCCESS' | 'FAILURE' | 'TAMPERED';
  institutionId?: string;
  certificateId?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const lastLog = await prisma.auditLog.findFirst({
    orderBy: { timestamp: 'desc' }
  });

  const previousHash = lastLog ? lastLog.eventHash : 'AUDIT_GENESIS_000000000000000000000000000000000000000000000000';
  const eventId = `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const timestamp = new Date().toISOString();

  const payload = {
    eventId,
    actorId: params.actorId,
    actorRole: params.actorRole,
    action: params.action,
    result: params.result,
    certificateId: params.certificateId || '',
    institutionId: params.institutionId || '',
    timestamp
  };

  const eventHash = generateAuditHash(payload, previousHash);

  const auditLog = await prisma.auditLog.create({
    data: {
      eventId,
      actorId: params.actorId,
      actorRole: params.actorRole,
      actorName: params.actorName,
      institutionId: params.institutionId,
      action: params.action,
      certificateId: params.certificateId,
      result: params.result,
      previousHash,
      eventHash,
      ipAddress: params.ipAddress || '127.0.0.1',
      userAgent: params.userAgent || 'CERTISEAL System',
      timestamp: new Date(timestamp)
    }
  });

  return auditLog;
}
