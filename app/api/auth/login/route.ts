import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;
    
    if (username === 'admin' && password === '12345') {
      return NextResponse.json({
        success: true,
        token: 'arsenal_admin_session_' + Date.now(),
        user: { username: 'admin', role: 'Super Administrator' }
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Sai tên đăng nhập hoặc mật khẩu!'
    }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
