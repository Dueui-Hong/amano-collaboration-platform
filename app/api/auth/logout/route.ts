// ============================================
// Logout API Route (보안 강화 버전)
// POST /api/auth/logout
// ============================================

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

export async function POST(request: Request) {
  try {
    // 쿠키에서 사용자 ID 가져오기
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('user_id');

    if (userIdCookie) {
      const userId = userIdCookie.value;
      const supabase = await createClient() as any;

      // IP 주소 및 User Agent 수집
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      // 감사 로그 생성
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'LOGOUT',
        ip_address: ip,
        user_agent: userAgent,
      });
    }

    // 쿠키 완전 삭제
    const response = NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: '로그아웃되었습니다.',
        },
      },
      { status: 200 }
    );

    // user_id 쿠키 삭제 (보안 강화)
    response.cookies.delete('user_id');
    
    // user_session 쿠키 삭제 (보안 강화)
    response.cookies.delete('user_session');

    // 추가 보안: 쿠키를 과거 시간으로 만료 처리
    response.cookies.set('user_id', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: -1,
      expires: new Date(0),
    });

    response.cookies.set('user_session', '', {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: -1,
      expires: new Date(0),
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
