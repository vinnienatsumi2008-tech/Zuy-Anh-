import { NextResponse } from 'next/server';
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await getAdminUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password, role } = body;
    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Thiếu tên đăng nhập hoặc mật khẩu' }, { status: 400 });
    }
    const newUser = await createAdminUser({ username, email: email || `${username}@arsenal.com`, password, role: role || 'Staff' });
    return NextResponse.json({ success: true, data: newUser });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, email, password, role } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Thiếu mã ID' }, { status: 400 });
    const updated = await updateAdminUser(id, { email, password, role });
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
    await deleteAdminUser(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
