// ============================================
// Weekly Report Detail API
// GET /api/reports/[id] - 보고서 상세 조회
// PUT /api/reports/[id] - 보고서 수정
// DELETE /api/reports/[id] - 보고서 삭제
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canViewReport, canEditReport } from '@/lib/auth/permissions';
import type { ApiResponse } from '@/types';

// GET - 보고서 상세 조회
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

    // 보고서 조회
    const { data: report, error } = await supabase
      .from('weekly_reports')
      .select(
        `
        *,
        author:users!weekly_reports_author_id_fkey(id, name, employee_id, team, position, profile_image_url),
        reviewer:users!weekly_reports_reviewer_id_fkey(id, name, employee_id, team, position, profile_image_url)
      `
      )
      .eq('id', id)
      .single();

    if (error || !report) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '보고서를 찾을 수 없습니다.', code: 'NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // 권한 확인
    if (!canViewReport(currentUser, report, report.author)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '조회 권한이 없습니다.', code: 'FORBIDDEN' },
        },
        { status: 403 }
      );
    }

    // 감사 로그
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'VIEW_REPORT',
      target_type: 'REPORT',
      target_id: report.id,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: report,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get report error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}

// PUT - 보고서 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { this_week_work, next_week_plan, issues } = body;

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

    // 기존 보고서 조회
    const { data: existingReport, error: fetchError } = await supabase
      .from('weekly_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingReport) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '보고서를 찾을 수 없습니다.', code: 'NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // 수정 권한 확인
    if (!canEditReport(currentUser, existingReport)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: '수정 권한이 없습니다. DRAFT 또는 REJECTED 상태만 수정 가능합니다.',
            code: 'FORBIDDEN',
          },
        },
        { status: 403 }
      );
    }

    // 보고서 수정
    const { data: report, error } = await supabase
      .from('weekly_reports')
      .update({
        this_week_work,
        next_week_plan,
        issues,
      })
      .eq('id', id)
      .select(
        `
        *,
        author:users!weekly_reports_author_id_fkey(id, name, employee_id, team, position),
        reviewer:users!weekly_reports_reviewer_id_fkey(id, name, employee_id, team, position)
      `
      )
      .single();

    if (error) throw error;

    // 감사 로그
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'UPDATE_REPORT',
      target_type: 'REPORT',
      target_id: report.id,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: report,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}

// DELETE - 보고서 삭제
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

    // 기존 보고서 조회
    const { data: existingReport, error: fetchError } = await supabase
      .from('weekly_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingReport) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '보고서를 찾을 수 없습니다.', code: 'NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // 삭제 권한 확인 (DRAFT 상태만 삭제 가능)
    if (
      existingReport.author_id !== currentUser.id ||
      existingReport.status !== 'DRAFT'
    ) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: '삭제 권한이 없습니다. DRAFT 상태만 삭제 가능합니다.',
            code: 'FORBIDDEN',
          },
        },
        { status: 403 }
      );
    }

    // 보고서 삭제
    const { error } = await supabase.from('weekly_reports').delete().eq('id', id);

    if (error) throw error;

    // 감사 로그
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'DELETE_REPORT',
      target_type: 'REPORT',
      target_id: id,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: '보고서가 삭제되었습니다.' },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}
