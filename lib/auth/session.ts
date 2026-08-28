import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Retrieves the AUTH_SECRET from environment variables.
 * FAILS FAST if AUTH_SECRET is missing or empty.
 */
function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error('CRITICAL SECURITY ERROR: AUTH_SECRET environment variable is missing or empty. Application must fail fast.');
  }
  return secret;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  institutionId?: string | null;
  institutionName?: string | null;
  institutionCode?: string | null;
}

/**
 * Creates a signed session token.
 */
export function createSessionToken(session: UserSession): string {
  const secret = getAuthSecret();
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

/**
 * Verifies and decodes a session token. Returns null if invalid, missing, or tampered.
 */
export function verifySessionToken(token: string): UserSession | null {
  if (!token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  
  try {
    const secret = getAuthSecret();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null; // Tampered token
    }

    const json = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(json) as UserSession;
  } catch (e) {
    return null;
  }
}

/**
 * Extracts and verifies session from request cookie or Authorization header.
 */
export async function getSession(req: Request): Promise<UserSession | null> {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/certiseal_session=([^;]+)/);
  
  let token = match ? match[1] : null;
  
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Enforces authentication. Throws error response if unauthenticated.
 */
export async function requireAuth(req: Request): Promise<UserSession> {
  const session = await getSession(req);
  if (!session) {
    throw new Error('UNAUTHORIZED: Authentication required.');
  }
  return session;
}

/**
 * Enforces server-side RBAC role permissions.
 */
export async function requireRole(req: Request, allowedRoles: string[]): Promise<UserSession> {
  const session = await requireAuth(req);
  if (!allowedRoles.includes(session.role)) {
    throw new Error(`FORBIDDEN: Role ${session.role} is not authorized for this operation.`);
  }
  return session;
}

/**
 * Enforces institution access scoping.
 */
export async function requireInstitutionAccess(req: Request, targetInstitutionId: string): Promise<UserSession> {
  const session = await requireAuth(req);
  if (session.role === 'SUPER_ADMIN') return session;

  if (!session.institutionId || session.institutionId !== targetInstitutionId) {
    throw new Error('FORBIDDEN: You are not authorized to manage credentials for this institution.');
  }
  return session;
}
