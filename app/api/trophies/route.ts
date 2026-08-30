import { NextResponse } from 'next/server';
import { getDb, saveDb, Trophy } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const sorted = [...db.trophies].sort((a, b) => a.display_order - b.display_order);
  return NextResponse.json({ success: true, data: sorted });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();
    const newTrophy: Trophy = {
      id: body.id || 'tr-' + Date.now(),
      title: body.title || 'Danh hiệu mới',
      count_label: body.count_label || '1x',
      years: body.years || '',
      desc: body.desc || '',
      icon: body.icon || '🏆',
      is_highlight: Boolean(body.is_highlight),
      display_order: Number(body.display_order) || db.trophies.length + 1
    };
    db.trophies.push(newTrophy);
    saveDb(db);
    return NextResponse.json({ success: true, data: newTrophy });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create trophy' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();
    const idx = db.trophies.findIndex(t => t.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Trophy not found' }, { status: 404 });
    }
    db.trophies[idx] = { ...db.trophies[idx], ...body, display_order: Number(body.display_order) || db.trophies[idx].display_order };
    saveDb(db);
    return NextResponse.json({ success: true, data: db.trophies[idx] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update trophy' }, { status: 500 });
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
    db.trophies = db.trophies.filter(t => t.id !== id);
    saveDb(db);
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete trophy' }, { status: 500 });
  }
}
