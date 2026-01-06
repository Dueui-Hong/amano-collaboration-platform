// ============================================
// Weekly Reports API - List & Create
// GET /api/reports - 보고서 목록 조회
// POST /api/reports - 보고서 생성
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canViewReport } from '@/lib/auth/permissions';
import type { ApiResponse, WeeklyReport, ReportFilterParams } from '@/types';

// GET - 보고서 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient() as any;
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
    const status = searchParams.get('status') || undefined;
    const author_id = searchParams.get('author_id') || undefined;
    const team = searchParams.get('team') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 쿼리 빌더
    let query = supabase
      .from('weekly_reports')
      .select(
        `
        *,
        author:users!weekly_reports_author_id_fkey(id, name, employee_id, team, position),
        reviewer:users!weekly_reports_reviewer_id_fkey(id, name, employee_id, team, position)
      `,
        { count: 'exact' }
      );

    // 권한에 따른 필터링
    if (currentUser.role === 'DEPARTMENT_HEAD') {
      // 부서장: 모든 보고서 조회 가능
    } else if (currentUser.role === 'TEAM_LEADER') {
      // 팀장: 본인 + 같은 팀 팀원의 보고서
      query = query.or(`author_id.eq.${currentUser.id},author.team.eq.${currentUser.team}`);
    } else {
      // 팀원: 본인 보고서만
      query = query.eq('author_id', currentUser.id);
    }

    // 추가 필터
    if (status) query = query.eq('status', status);
    if (author_id) query = query.eq('author_id', author_id);
    if (team) query = query.eq('author.team', team);

    // 정렬 및 페이지네이션
    query = query
      .order('week_start_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: reports, error, count } = await query;

    if (error) throw error;

    // 감사 로그
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'VIEW_REPORTS',
      details: { filters: { status, author_id, team, page, limit } },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: reports,
        meta: {
          total: count || 0,
          page,
          limit,
          total_pages: Math.ceil((count || 0) / limit),
        } as any,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}

// POST - 보고서 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient() as any;
    const body = await request.json();

    const {
      week_start_date,
      week_end_date,
      this_week_work,
      next_week_plan,
      issues,
    } = body;

    // 필수 필드 검증
    if (!week_start_date || !week_end_date || !this_week_work || !next_week_plan) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '필수 항목을 모두 입력해주세요.', code: 'MISSING_FIELDS' },
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

    // 중복 체크 (같은 주에 이미 보고서가 있는지)
    const { data: existing } = await supabase
      .from('weekly_reports')
      .select('id')
      .eq('author_id', currentUser.id)
      .eq('week_start_date', week_start_date)
      .single();

    if (existing) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: '해당 주차의 보고서가 이미 존재합니다.',
            code: 'DUPLICATE_REPORT',
          },
        },
        { status: 409 }
      );
    }

    // 팀장 자동 할당 (같은 팀의 팀장)
    const { data: teamLeader } = await supabase
      .from('users')
      .select('id')
      .eq('team', currentUser.team)
      .eq('role', 'TEAM_LEADER')
      .single();

    // 보고서 생성
    const { data: report, error } = await supabase
      .from('weekly_reports')
      .insert({
        author_id: currentUser.id,
        week_start_date,
        week_end_date,
        this_week_work,
        next_week_plan,
        issues,
        status: 'DRAFT',
        reviewer_id: teamLeader?.id || null,
      })
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
      action: 'CREATE_REPORT',
      target_type: 'REPORT',
      target_id: report.id,
      details: { week_start_date, week_end_date },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: report,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}
