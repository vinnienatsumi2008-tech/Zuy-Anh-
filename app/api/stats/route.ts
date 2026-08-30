import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const totalRevenue = db.orders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => acc + o.total_amount, 0);
  const pendingOrders = db.orders.filter(o => o.status === 'PENDING').length;
  return NextResponse.json({
    success: true,
    data: {
      totalRevenue,
      totalOrders: db.orders.length,
      pendingOrders,
      totalProducts: db.products.length,
      totalGallery: db.gallery.length,
      totalTrophies: db.trophies.length
    }
  });
}
