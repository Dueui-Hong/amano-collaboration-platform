// ============================================
// Login API Route
// POST /api/auth/login
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyPassword } from '@/lib/auth/utils';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_id, password } = body;

    if (!employee_id || !password) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: '사원번호와 비밀번호를 입력해주세요.',
            code: 'MISSING_CREDENTIALS',
          },
        },
        { status: 400 }
      );
    }

    const supabase = await createClient() as any;

    // 사용자 조회
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('employee_id', employee_id)
      .single();

    if (userError || !user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: '사원번호 또는 비밀번호가 일치하지 않습니다.',
            code: 'INVALID_CREDENTIALS',
          },
        },
        { status: 401 }
      );
    }

    // 비밀번호 검증
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: '사원번호 또는 비밀번호가 일치하지 않습니다.',
            code: 'INVALID_CREDENTIALS',
          },
        },
        { status: 401 }
      );
    }

    // Supabase Auth 세션 생성
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.employee_id, // Supabase Auth용 임시 비밀번호
    });

    // Supabase Auth 사용자가 없으면 생성
    if (authError && authError.message.includes('Invalid login credentials')) {
      const { error: signUpError } = await supabase.auth.signUp({
        email: user.email,
        password: user.employee_id,
        options: {
          data: {
            employee_id: user.employee_id,
            name: user.name,
          },
        },
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
      }

      // 다시 로그인 시도
      const { data: retryAuthData, error: retryError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.employee_id,
      });

      if (retryError) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              message: '인증 처리 중 오류가 발생했습니다.',
              code: 'AUTH_ERROR',
              details: retryError,
            },
          },
          { status: 500 }
        );
      }
    }

    // 마지막 로그인 시간 업데이트
    await supabase
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // 감사 로그 생성
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'LOGIN',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    // 민감 정보 제거
    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          user: userWithoutPassword,
          isFirstLogin: user.is_first_login,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
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
