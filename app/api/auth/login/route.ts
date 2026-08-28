import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { createSessionToken } from '@/lib/auth/session';
import { LoginSchema } from '@/lib/validation/schemas';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Zod input validation
    const validated = LoginSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid login payload format.', details: validated.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;

    // 2. REQUIRE Email and Password (NO ROLE BYPASS PERMITTED)
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Authentication requires valid email address and password.' },
        { status: 400 }
      );
    }

    // 3. Find user in database by email
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { institution: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email address or password.' }, { status: 401 });
    }

    // 4. Verify password against Bcrypt hash (NO DEMO BYPASS)
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email address or password.' }, { status: 401 });
    }

    // 5. Construct server-verified session payload
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

    // 6. Set HttpOnly secure session cookie
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
