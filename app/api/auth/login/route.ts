import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, email } = body;

    let user;

    if (role) {
      user = await prisma.user.findFirst({
        where: { role },
        include: { institution: true }
      });
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email },
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

    const response = NextResponse.json({ success: true, user: sessionPayload });
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
