import { NextResponse } from 'next/server';
import { getDb, saveDb, GalleryItem } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const sorted = [...db.gallery].sort((a, b) => a.display_order - b.display_order);
  return NextResponse.json({ success: true, data: sorted });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();
    const newItem: GalleryItem = {
      id: body.id || 'gal-' + Date.now(),
      title: body.title || 'Hình ảnh mới',
      desc: body.desc || '',
      tag: body.tag || '',
      category: body.category || 'badge',
      image_url: body.image_url || '/assets/images/arsenal-1886-crest.png',
      display_order: Number(body.display_order) || db.gallery.length + 1
    };
    db.gallery.push(newItem);
    saveDb(db);
    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create gallery item' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();
    const idx = db.gallery.findIndex(g => g.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    db.gallery[idx] = { ...db.gallery[idx], ...body, display_order: Number(body.display_order) || db.gallery[idx].display_order };
    saveDb(db);
    return NextResponse.json({ success: true, data: db.gallery[idx] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update gallery item' }, { status: 500 });
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
    db.gallery = db.gallery.filter(g => g.id !== id);
    saveDb(db);
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete gallery item' }, { status: 500 });
  }
}
