import { NextResponse } from 'next/server';
import { getDb, saveDb, TimelineEvent } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const sorted = [...db.timeline].sort((a, b) => a.display_order - b.display_order);
  return NextResponse.json({ success: true, data: sorted });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();
    const newEvent: TimelineEvent = {
      id: body.id || 'tl-' + Date.now(),
      year_label: body.year_label || '1886',
      title: body.title || 'Cột mốc mới',
      content: body.content || '',
      is_highlight: Boolean(body.is_highlight),
      display_order: Number(body.display_order) || db.timeline.length + 1
    };
    db.timeline.push(newEvent);
    saveDb(db);
    return NextResponse.json({ success: true, data: newEvent });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create timeline event' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();
    const idx = db.timeline.findIndex(t => t.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Timeline event not found' }, { status: 404 });
    }
    db.timeline[idx] = { ...db.timeline[idx], ...body, display_order: Number(body.display_order) || db.timeline[idx].display_order };
    saveDb(db);
    return NextResponse.json({ success: true, data: db.timeline[idx] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update timeline event' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    }
    const db = getDb();
    db.timeline = db.timeline.filter(t => t.id !== id);
    saveDb(db);
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete timeline event' }, { status: 500 });
  }
}
