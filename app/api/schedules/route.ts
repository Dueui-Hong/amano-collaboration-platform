// ============================================
// Schedules API - List & Create
// GET /api/schedules - 일정 목록 조회
// POST /api/schedules - 일정 생성
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canViewSchedule, canCreatePublicSchedule } from '@/lib/auth/permissions';
import type { ApiResponse, Schedule } from '@/types';

// GET - 일정 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // 현재 사용자 확인
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '인증되지 않은 사용자입니다.', code: 'UNAUTHORIZED' },
        },
        { status: 401 }
      );
    }

    // 사용자 정보 조회
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '사용자 정보를 찾을 수 없습니다.', code: 'USER_NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // 필터 파라미터 추출
    const type = searchParams.get('type') || undefined;
    const start_date = searchParams.get('start_date') || undefined;
    const end_date = searchParams.get('end_date') || undefined;

    // 쿼리 빌더
    let query = supabase
      .from('schedules')
      .select(
        `
        *,
        creator:users!schedules_created_by_fkey(id, name, employee_id, team, position)
      `
      );

    // PUBLIC 일정은 모두 조회, PRIVATE은 본인 것만
    query = query.or(`type.eq.PUBLIC,created_by.eq.${currentUser.id}`);

    // 추가 필터
    if (type) query = query.eq('type', type);
    if (start_date) query = query.gte('start_date', start_date);
    if (end_date) query = query.lte('end_date', end_date);

    // 정렬
    query = query.order('start_date', { ascending: true });

    const { data: schedules, error } = await query;

    if (error) throw error;

    // 감사 로그
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'VIEW_SCHEDULES',
      details: { filters: { type, start_date, end_date } },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: schedules,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get schedules error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}

// POST - 일정 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { title, description, start_date, end_date, type, color } = body;

    // 필수 필드 검증
    if (!title || !start_date || !end_date || !type) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '필수 항목을 모두 입력해주세요.', code: 'MISSING_FIELDS' },
        },
        { status: 400 }
      );
    }

    // 타입 검증
    if (type !== 'PUBLIC' && type !== 'PRIVATE') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: '유효하지 않은 일정 타입입니다. PUBLIC 또는 PRIVATE만 가능합니다.',
            code: 'INVALID_TYPE',
          },
        },
        { status: 400 }
      );
    }

    // 현재 사용자 확인
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '인증되지 않은 사용자입니다.', code: 'UNAUTHORIZED' },
        },
        { status: 401 }
      );
    }

    // 사용자 정보 조회
    const { data: currentUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (!currentUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '사용자 정보를 찾을 수 없습니다.', code: 'USER_NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // PUBLIC 일정 생성 권한 확인 (팀장 이상만)
    if (type === 'PUBLIC' && !canCreatePublicSchedule(currentUser)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: 'PUBLIC 일정은 팀장 이상만 생성할 수 있습니다.',
            code: 'FORBIDDEN',
          },
        },
        { status: 403 }
      );
    }

    // 일정 생성
    const { data: schedule, error } = await supabase
      .from('schedules')
      .insert({
        title,
        description,
        start_date,
        end_date,
        type,
        color: color || '#3b82f6',
        created_by: currentUser.id,
      })
      .select(
        `
        *,
        creator:users!schedules_created_by_fkey(id, name, employee_id, team, position)
      `
      )
      .single();

    if (error) throw error;

    // 감사 로그
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'CREATE_SCHEDULE',
      target_type: 'SCHEDULE',
      target_id: schedule.id,
      details: { title, type, start_date, end_date },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: schedule,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create schedule error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}
