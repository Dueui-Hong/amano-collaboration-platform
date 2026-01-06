// ============================================
// Post Permissions API
// POST /api/posts/[id]/permissions - 게시물 권한 부여 (팀장)
// DELETE /api/posts/[id]/permissions - 게시물 권한 해제
// GET /api/posts/[id]/permissions - 권한 목록 조회
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canGrantPostPermission } from '@/lib/auth/permissions';
import type { ApiResponse } from '@/types';

// GET - 권한 목록 조회
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

    // 게시물 조회
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '게시물을 찾을 수 없습니다.', code: 'NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // 권한 부여 가능 여부 확인
    if (!canGrantPostPermission(currentUser, post)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '권한 조회 권한이 없습니다.', code: 'FORBIDDEN' },
        },
        { status: 403 }
      );
    }

    // 권한 목록 조회
    const { data: permissions, error } = await supabase
      .from('post_permissions')
      .select(
        `
        *,
        user:users!post_permissions_user_id_fkey(id, name, employee_id, team, position),
        granted_by_user:users!post_permissions_granted_by_fkey(id, name, employee_id)
      `
      )
      .eq('post_id', id);

    if (error) throw error;

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: permissions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get post permissions error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}

// POST - 권한 부여
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { user_ids } = body;

    // 필수 필드 검증
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '권한을 부여할 사용자를 선택해주세요.', code: 'MISSING_FIELDS' },
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

    // 게시물 조회
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '게시물을 찾을 수 없습니다.', code: 'NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // 권한 부여 가능 여부 확인
    if (!canGrantPostPermission(currentUser, post)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '권한 부여 권한이 없습니다.', code: 'FORBIDDEN' },
        },
        { status: 403 }
      );
    }

    // 권한 부여 (중복 무시)
    const permissionsToInsert = user_ids.map((user_id) => ({
      post_id: id,
      user_id,
      granted_by: currentUser.id,
    }));

    const { data: permissions, error } = await supabase
      .from('post_permissions')
      .upsert(permissionsToInsert, { onConflict: 'post_id,user_id' })
      .select(
        `
        *,
        user:users!post_permissions_user_id_fkey(id, name, employee_id, team, position)
      `
      );

    if (error) throw error;

    // 감사 로그
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'GRANT_PERMISSION',
      target_type: 'POST_PERMISSION',
      target_id: id,
      details: { user_ids },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: permissions,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Grant post permission error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}

// DELETE - 권한 해제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '사용자 ID를 입력해주세요.', code: 'MISSING_FIELDS' },
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

    // 게시물 조회
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '게시물을 찾을 수 없습니다.', code: 'NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // 권한 해제 가능 여부 확인
    if (!canGrantPostPermission(currentUser, post)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '권한 해제 권한이 없습니다.', code: 'FORBIDDEN' },
        },
        { status: 403 }
      );
    }

    // 권한 해제
    const { error } = await supabase
      .from('post_permissions')
      .delete()
      .eq('post_id', id)
      .eq('user_id', user_id);

    if (error) throw error;

    // 감사 로그
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'REVOKE_PERMISSION',
      target_type: 'POST_PERMISSION',
      target_id: id,
      details: { user_id },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: '권한이 해제되었습니다.' },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Revoke post permission error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}
