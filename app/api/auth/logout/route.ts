// ============================================
// Logout API Route (JWT + 쿠키 삭제)
// POST /api/auth/logout
// ============================================

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { verifyToken } from '@/lib/auth/jwt';
import type { ApiResponse } from '@/types';

export async function POST() {
  try {
    // 쿠키에서 JWT 토큰 가져오기
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (tokenCookie) {
      const payload = await verifyToken(tokenCookie.value);
      
      if (payload) {
        const supabase = await createClient() as any;

        // 감사 로그 생성
        await supabase.from('audit_logs').insert({
          user_id: payload.userId,
          action: 'LOGOUT',
        });
      }
    }

    // 쿠키 삭제
    const response = NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: '로그아웃되었습니다.',
        },
      },
      { status: 200 }
    );

    // token 쿠키 삭제
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    // user_session 쿠키 삭제
    response.cookies.set('user_session', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          message: '서버 오류가 발생했습니다.',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
