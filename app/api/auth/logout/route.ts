// ============================================
// Logout API Route (쿠키 세션 방식)
// POST /api/auth/logout
// ============================================

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

export async function POST() {
  try {
    // 쿠키에서 사용자 ID 가져오기
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('user_id');

    if (userIdCookie) {
      const userId = userIdCookie.value;
      const supabase = await createClient() as any;

      // 감사 로그 생성
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'LOGOUT',
      });
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

    // user_id 쿠키 삭제
    response.cookies.set('user_id', '', {
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
