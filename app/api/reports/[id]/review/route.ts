// ============================================
// Weekly Report Review API
// POST /api/reports/[id]/review - 보고서 검토 (팀장)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canReviewReport } from '@/lib/auth/permissions';
import type { ApiResponse } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { status, reviewer_comment } = body;

    // 상태 검증
    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: '유효하지 않은 상태입니다. APPROVED 또는 REJECTED만 가능합니다.',
            code: 'INVALID_STATUS',
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

    // 기존 보고서 조회 (작성자 정보 포함)
    const { data: existingReport, error: fetchError } = await supabase
      .from('weekly_reports')
      .select(
        `
        *,
        author:users!weekly_reports_author_id_fkey(*)
      `
      )
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

    // 검토 권한 확인
    if (!canReviewReport(currentUser, existingReport, existingReport.author)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: '검토 권한이 없습니다. 팀장 이상만 가능하며, SUBMITTED 상태여야 합니다.',
            code: 'FORBIDDEN',
          },
        },
        { status: 403 }
      );
    }

    // 보고서 검토 (상태 변경 및 코멘트 추가)
    const { data: report, error } = await supabase
      .from('weekly_reports')
      .update({
        status,
        reviewer_id: currentUser.id,
        reviewer_comment,
        reviewed_at: new Date().toISOString(),
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
      action: status === 'APPROVED' ? 'APPROVE_REPORT' : 'REJECT_REPORT',
      target_type: 'REPORT',
      target_id: report.id,
      details: { status, reviewer_comment },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: report,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Review report error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}
