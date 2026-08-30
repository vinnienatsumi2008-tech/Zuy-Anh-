import { NextResponse } from 'next/server';
import { authenticateAdminUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu'
      }, { status: 400 });
    }

    const authResult = await authenticateAdminUser(username, password);
    
    if (authResult.success && authResult.user) {
      return NextResponse.json({
        success: true,
        token: 'sb_auth_token_' + Buffer.from(authResult.user.id + ':' + Date.now()).toString('base64'),
        user: authResult.user,
        provider: 'supabase-postgresql-auth'
      });
    }
    
    return NextResponse.json({
      success: false,
      message: authResult.error || 'Tài khoản hoặc mật khẩu không chính xác'
    }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
