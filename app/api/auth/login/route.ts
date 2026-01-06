// ============================================
// Login API Route (JWT + HTTP-only Cookie)
// POST /api/auth/login
// ============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createToken } from '@/lib/auth/jwt';
import { compare } from 'bcryptjs';
import type { ApiResponse } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employee_id, password } = body;

    // 입력 검증
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

    // 사용자 조회 (서비스 역할 키 사용)
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('employee_id', employee_id)
      .single();

    if (error || !user) {
      console.error('User not found:', employee_id);
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
    const isValidPassword = await compare(password, user.password_hash);

    if (!isValidPassword) {
      console.error('Invalid password for:', employee_id);
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

    // JWT 토큰 생성
    const token = await createToken({
      userId: user.id,
      employeeId: user.employee_id,
      role: user.role,
      team: user.team,
    });

    // 마지막 로그인 시간 업데이트
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // 감사 로그 기록
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'LOGIN',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    // 민감 정보 제거
    const { password_hash, ...userWithoutPassword } = user;

    // JWT 토큰을 HTTP-only 쿠키로 설정
    const response = NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          user: userWithoutPassword,
          isFirstLogin: user.is_first_login,
        },
      },
      { status: 200 }
    );

    // HTTP-only 쿠키 설정 (7일 만료)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7일
    });

    // 사용자 정보 쿠키 (클라이언트 접근 가능)
    response.cookies.set(
      'user_session',
      JSON.stringify({
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        role: user.role,
        team: user.team,
      }),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7일
      }
    );

    return response;
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
