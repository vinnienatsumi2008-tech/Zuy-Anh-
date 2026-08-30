import { NextResponse } from 'next/server';
import { getTrophies, createTrophy, deleteTrophy } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const trophies = await getTrophies();
    return NextResponse.json({ success: true, data: trophies });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newTrophy = await createTrophy(body);
    return NextResponse.json({ success: true, data: newTrophy });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    await deleteTrophy(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
