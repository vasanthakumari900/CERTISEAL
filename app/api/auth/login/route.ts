import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { createSessionToken } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    let user;

    if (email && password) {
      user = await prisma.user.findUnique({
        where: { email },
        include: { institution: true }
      });

      if (!user || !verifyPassword(password, user.passwordHash)) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }
    } else if (role) {
      // Role Switcher Demo convenience flow
      user = await prisma.user.findFirst({
        where: { role },
        include: { institution: true }
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
      institutionName: user.institution ? user.institution.officialName : null,
      institutionCode: user.institution ? user.institution.shortName : null
    };

    const token = createSessionToken(sessionPayload);

    const response = NextResponse.json({ success: true, user: sessionPayload });

    // Set HttpOnly secure session cookie
    response.cookies.set('certiseal_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400 // 24 hours
    });

    // Legacy cookie compatibility for frontend quick switcher display
    response.cookies.set('certiseal_user', JSON.stringify(sessionPayload), {
      httpOnly: false,
      path: '/',
      maxAge: 86400
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Authentication error' }, { status: 500 });
  }
}
