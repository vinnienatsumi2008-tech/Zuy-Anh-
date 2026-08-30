import { NextResponse } from 'next/server';
import { getTimeline, createTimeline, updateTimeline, deleteTimeline } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const timeline = await getTimeline();
    return NextResponse.json({ success: true, data: timeline });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newEvent = await createTimeline(body);
    return NextResponse.json({ success: true, data: newEvent });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Thiếu mã ID' }, { status: 400 });
    const updated = await updateTimeline(id, data);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Thiếu mã ID' }, { status: 400 });
    await deleteTimeline(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
