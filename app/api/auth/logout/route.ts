import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  response.cookies.delete('certiseal_session');
  response.cookies.delete('certiseal_user');

  return response;
}
