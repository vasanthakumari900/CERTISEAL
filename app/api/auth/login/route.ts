import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { createSessionToken } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body || {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication requires email and password.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { institution: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid email or password.' }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Unauthorized: Invalid email or password.' }, { status: 401 });
    }

    // Construct server-verified session payload
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

    // Client display metadata cookie (non-privileged)
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
