import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  if (username !== process.env.ADMIN_USERNAME) return NextResponse.json({ error: 'Invalid' }, { status: 401 });
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  const ok = await bcrypt.compare(password, hash);
  if (!ok) return NextResponse.json({ error: 'Invalid' }, { status: 401 });
  // simplistic: client re-sends password as bearer for now; could mint JWT instead
  return NextResponse.json({ token: password });
}
