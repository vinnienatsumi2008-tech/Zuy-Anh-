import { NextResponse } from 'next/server';
import { getDb, saveDb, Order } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const sorted = [...db.orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return NextResponse.json({ success: true, data: sorted });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();
    const randomCode = 'ARS-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      order_code: randomCode,
      fullname: body.fullname || 'Khách hàng',
      phone: body.phone || '',
      address: body.address || '',
      items: Array.isArray(body.items) ? body.items : [],
      custom_name: body.custom_name || '',
      custom_number: body.custom_number || '',
      payment_method: body.payment_method || 'COD',
      total_amount: Number(body.total_amount) || 0,
      status: 'PENDING',
      created_at: new Date().toISOString()
    };
    db.orders.unshift(newOrder);
    saveDb(db);
    return NextResponse.json({ success: true, data: newOrder });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    const db = getDb();
    const idx = db.orders.findIndex(o => o.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    db.orders[idx].status = status;
    saveDb(db);
    return NextResponse.json({ success: true, data: db.orders[idx] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update order status' }, { status: 500 });
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
    db.orders = db.orders.filter(o => o.id !== id);
    saveDb(db);
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete order' }, { status: 500 });
  }
}
