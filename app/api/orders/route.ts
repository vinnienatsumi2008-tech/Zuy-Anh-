import { NextResponse } from 'next/server';
import { getOrders, createOrder, updateOrder, updateOrderStatus, deleteOrder } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newOrder = await createOrder(body);
    return NextResponse.json({ success: true, data: newOrder });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Thiếu mã ID' }, { status: 400 });
    await updateOrder(id, data);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) return NextResponse.json({ success: false, error: 'Thiếu mã ID hoặc trạng thái' }, { status: 400 });
    await updateOrderStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Thiếu mã ID' }, { status: 400 });
    await deleteOrder(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
