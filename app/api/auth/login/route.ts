// ============================================
// Login API Route
// POST /api/auth/login
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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

    // Service Role Key를 사용하여 RLS 우회
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 사용자 조회
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('employee_id', employee_id)
      .single();

    console.log('=== Login Debug ===');
    console.log('Employee ID:', employee_id);
    console.log('User found:', !!user);
    console.log('User error:', userError);
    if (user) {
      console.log('User data:', { 
        id: user.id, 
        employee_id: user.employee_id, 
        email: user.email,
        has_password: !!user.password_hash 
      });
    }

    if (userError || !user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: '사원번호 또는 비밀번호가 일치하지 않습니다.',
            code: 'INVALID_CREDENTIALS',
            details: userError,
          },
        },
        { status: 401 }
      );
    }

    // 비밀번호 검증
    const isValidPassword = await verifyPassword(password, user.password_hash);

    console.log('Password verification:', isValidPassword);

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

    // 마지막 로그인 시간 업데이트
    await supabaseAdmin
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // 감사 로그 생성
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'LOGIN',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    // 민감 정보 제거
    const { password_hash, ...userWithoutPassword } = user;

    // 세션 쿠키 설정 (간단한 JWT 대신)
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

    // 세션 쿠키에 사용자 ID 저장
    response.cookies.set('user_id', user.id, {
      httpOnly: true, // XSS 방지: JavaScript로 접근 불가
      secure: true, // HTTPS에서만 전송
      sameSite: 'strict', // CSRF 방지: 같은 사이트에서만 쿠키 전송
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    });

    response.cookies.set('user_session', JSON.stringify({
      id: user.id,
      employee_id: user.employee_id,
      role: user.role,
      team: user.team,
    }), {
      httpOnly: true, // XSS 방지: JavaScript로 접근 불가
      secure: true, // HTTPS에서만 전송
      sameSite: 'strict', // CSRF 방지: 같은 사이트에서만 쿠키 전송
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    });

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
