// ============================================
// Logout API Route
// POST /api/auth/logout
// ============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

export async function POST() {
  try {
    const supabase = await createClient();

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // 감사 로그 생성
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'LOGOUT',
      });
    }

    // Supabase Auth 로그아웃
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: '로그아웃 처리 중 오류가 발생했습니다.',
            code: 'LOGOUT_ERROR',
            details: error,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: '로그아웃되었습니다.',
        },
      },
      { status: 200 }
    );
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
