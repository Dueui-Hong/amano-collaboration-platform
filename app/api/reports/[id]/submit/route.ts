// ============================================
// Weekly Report Submit API
// POST /api/reports/[id]/submit - 보고서 제출
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient() as any;

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

    // 제출 권한 확인 (본인의 DRAFT 또는 REJECTED 상태만)
    if (existingReport.author_id !== currentUser.id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '제출 권한이 없습니다.', code: 'FORBIDDEN' },
        },
        { status: 403 }
      );
    }

    if (existingReport.status !== 'DRAFT' && existingReport.status !== 'REJECTED') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: 'DRAFT 또는 REJECTED 상태만 제출 가능합니다.',
            code: 'INVALID_STATUS',
          },
        },
        { status: 400 }
      );
    }

    // 보고서 제출 (상태 변경)
    const { data: report, error } = await supabase
      .from('weekly_reports')
      .update({
        status: 'SUBMITTED',
        submitted_at: new Date().toISOString(),
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
      action: 'SUBMIT_REPORT',
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
    console.error('Submit report error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}
