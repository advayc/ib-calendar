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
  return bcrypt.compareSync(token, stored);
}

function isAuthorizedDevFallback(req: NextRequest) {
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clubId = searchParams.get('clubId');
    const events = await prisma.event.findMany({
      where: clubId ? { clubId } : undefined,
      orderBy: { date: 'asc' }
    });
    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedDevFallback(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { title, description, date, time, clubId, recurrence, location } = body;
  if (!title || !date || !clubId) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  try {
    // If recurrence provided, expand
    const created: any[] = [];
    if (recurrence?.frequency === 'weekly') {
      const interval = recurrence.interval || 1;
      const max = recurrence.count || 52;
      let current = new Date(date);
      let count = 0;
      const until = recurrence.until ? new Date(recurrence.until) : undefined;
      // Generate a unique group ID for this recurring series
      const groupId = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      while (count < max) {
        if (until && current > until) break;
        const e = await prisma.event.create({
          data: {
            title,
            description,
            location,
            date: current,
            time,
            clubId,
            recurrenceFrequency: 'WEEKLY',
            recurrenceInterval: interval,
            recurrenceCount: recurrence.count,
            recurrenceUntil: recurrence.until ? new Date(recurrence.until) : undefined,
            recurrenceGroupId: groupId
          }
        });
        created.push(e);
        current = new Date(current.getTime() + interval * 7 * 24 * 60 * 60 * 1000);
        count++;
      }
      return NextResponse.json(created, { status: 201 });
    } else {
      const event = await prisma.event.create({
  data: { title, description, location, date: new Date(date), time, clubId }
      });
      return NextResponse.json(event, { status: 201 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorizedDevFallback(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  try {
  if (updates.date) updates.date = new Date(updates.date);
    const event = await prisma.event.update({ where: { id }, data: updates });
    return NextResponse.json(event);
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
    // Check if this event is part of a recurring series
    const event = await prisma.event.findUnique({ where: { id } });
    if (event?.recurrenceGroupId) {
      // Delete all events in the same recurring series
      await prisma.event.deleteMany({ where: { recurrenceGroupId: event.recurrenceGroupId } });
      return NextResponse.json({ success: true, deletedSeries: true });
    } else {
      // Delete single event
      await prisma.event.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
