import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

/* eslint-disable @typescript-eslint/no-explicit-any */

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth) return false;
  const token = auth.replace('Bearer ', '').trim();
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored) return false;
  // Compare token (plaintext password) to hash
  return bcrypt.compareSync(token, stored);
}

// Development helper: if no ADMIN_PASSWORD_HASH is configured and we're not in production,
// allow requests to simplify local development.
function isAuthorizedDevFallback(req: NextRequest) {
  // In development we prefer a DEV_ADMIN_PASSWORD to avoid accidental public
  // access. If DEV_ADMIN_PASSWORD is set, require it; otherwise allow with
  // a console warning for convenience.
  if (process.env.NODE_ENV !== 'production') {
    const devPass = process.env.DEV_ADMIN_PASSWORD;
    if (devPass) {
      const auth = req.headers.get('authorization');
      if (!auth) return false;
      const token = auth.replace('Bearer ', '').trim();
      return token === devPass;
    }
    console.warn('DEV_ADMIN_PASSWORD not set; allowing all requests in development');
    return true;
  }
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored) return false;
  return isAuthorized(req);
}

export async function GET() {
  const clubs = await prisma.club.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(clubs);
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedDevFallback(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { name, slug, color } = body;
  if (!name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const finalSlug = slug && String(slug).trim() ? String(slug).trim() : slugify(name);
  try {
    const club = await prisma.club.create({ data: { name, slug: finalSlug, color: color || '#007AFF' } });
    return NextResponse.json(club, { status: 201 });
  } catch (e: any) {
    // Log full error for debugging
    console.error('[api/clubs] create error:', e);
    // Handle Prisma unique constraint (slug) error more nicely
    if (e?.code === 'P2002' && Array.isArray(e?.meta?.target) && e.meta.target.includes('slug')) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    // Return stack during local development to help debug
    const payload: any = { error: e?.message || String(e) };
    if (process.env.NODE_ENV !== 'production') payload.stack = e?.stack;
    return NextResponse.json(payload, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorizedDevFallback(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  try {
    const club = await prisma.club.update({ where: { id }, data: updates });
    return NextResponse.json(club);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorizedDevFallback(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  try {
    await prisma.club.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}