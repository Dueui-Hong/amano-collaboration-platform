// ============================================
// Get Current User API Route (JWT 기반)
// GET /api/auth/me
// ============================================

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { verifyToken } from '@/lib/auth/jwt';
import type { ApiResponse } from '@/types';

export async function GET() {
  try {
    // 쿠키에서 JWT 토큰 가져오기
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: '인증되지 않은 사용자입니다.',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      );
    }

    // JWT 토큰 검증
    const payload = await verifyToken(tokenCookie.value);

    if (!payload) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: '유효하지 않은 토큰입니다.',
            code: 'INVALID_TOKEN',
          },
        },
        { status: 401 }
      );
    }

    const supabase = await createClient() as any;

    // DB에서 사용자 정보 조회
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .single();

    if (error || !user) {
      console.error('User fetch error:', error);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: '사용자 정보를 찾을 수 없습니다.',
            code: 'USER_NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // 민감 정보 제거
    const { password_hash, ...userWithoutPassword } = user as any;

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
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
