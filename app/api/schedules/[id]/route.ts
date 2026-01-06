// ============================================
// Schedule Detail API
// GET /api/schedules/[id] - 일정 상세 조회
// PUT /api/schedules/[id] - 일정 수정
// DELETE /api/schedules/[id] - 일정 삭제
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canViewSchedule, canEditSchedule } from '@/lib/auth/permissions';
import type { ApiResponse } from '@/types';

// GET - 일정 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

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

    // 일정 조회
    const { data: schedule, error } = await supabase
      .from('schedules')
      .select(
        `
        *,
        creator:users!schedules_created_by_fkey(id, name, employee_id, team, position, profile_image_url)
      `
      )
      .eq('id', id)
      .single();

    if (error || !schedule) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '일정을 찾을 수 없습니다.', code: 'NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // 권한 확인
    if (!canViewSchedule(currentUser, schedule)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '조회 권한이 없습니다.', code: 'FORBIDDEN' },
        },
        { status: 403 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: schedule,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get schedule error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}

// PUT - 일정 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { title, description, start_date, end_date, color } = body;

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

    // 기존 일정 조회
    const { data: existingSchedule, error: fetchError } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingSchedule) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '일정을 찾을 수 없습니다.', code: 'NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // 수정 권한 확인
    if (!canEditSchedule(currentUser, existingSchedule)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '수정 권한이 없습니다.', code: 'FORBIDDEN' },
        },
        { status: 403 }
      );
    }

    // 일정 수정
    const { data: schedule, error } = await supabase
      .from('schedules')
      .update({
        title,
        description,
        start_date,
        end_date,
        color,
      })
      .eq('id', id)
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
      action: 'UPDATE_SCHEDULE',
      target_type: 'SCHEDULE',
      target_id: schedule.id,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: schedule,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update schedule error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}

// DELETE - 일정 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

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

    // 기존 일정 조회
    const { data: existingSchedule, error: fetchError } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingSchedule) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '일정을 찾을 수 없습니다.', code: 'NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // 삭제 권한 확인
    if (!canEditSchedule(currentUser, existingSchedule)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '삭제 권한이 없습니다.', code: 'FORBIDDEN' },
        },
        { status: 403 }
      );
    }

    // 일정 삭제
    const { error } = await supabase.from('schedules').delete().eq('id', id);

    if (error) throw error;

    // 감사 로그
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'DELETE_SCHEDULE',
      target_type: 'SCHEDULE',
      target_id: id,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: '일정이 삭제되었습니다.' },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete schedule error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}
