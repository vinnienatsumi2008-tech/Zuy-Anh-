import { NextResponse } from 'next/server';
import { getDb, saveDb, Product } from '@/lib/db';

export async function GET() {
  const db = getDb();
  return NextResponse.json({ success: true, data: db.products });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();
    const newProduct: Product = {
      id: body.id || 'prod-' + Date.now(),
      name: body.name || 'Sản phẩm mới',
      price: Number(body.price) || 0,
      version: body.version || 'Home',
      tag: body.tag || '',
      description: body.description || '',
      features: Array.isArray(body.features) ? body.features : [],
      image_url: body.image_url || '/assets/images/arsenal-home.jpg',
      is_featured: Boolean(body.is_featured),
      in_stock: body.in_stock !== undefined ? Boolean(body.in_stock) : true
    };
    db.products.push(newProduct);
    saveDb(db);
    return NextResponse.json({ success: true, data: newProduct });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();
    const idx = db.products.findIndex(p => p.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    db.products[idx] = { ...db.products[idx], ...body, price: Number(body.price) || db.products[idx].price };
    saveDb(db);
    return NextResponse.json({ success: true, data: db.products[idx] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
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
    db.products = db.products.filter(p => p.id !== id);
    saveDb(db);
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
