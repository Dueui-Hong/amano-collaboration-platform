// ============================================
// Get Current User API Route
// GET /api/auth/me
// ============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

export async function GET() {
  try {
    const supabase = await createClient() as any;

    // 현재 인증된 사용자 확인
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
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

    // DB에서 사용자 정보 조회
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error || !user) {
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
