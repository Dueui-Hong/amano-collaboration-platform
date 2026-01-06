// ============================================
// Post Detail API
// GET /api/posts/[id] - 게시물 상세 조회
// PUT /api/posts/[id] - 게시물 수정
// DELETE /api/posts/[id] - 게시물 삭제
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canViewPost, canEditPost } from '@/lib/auth/permissions';
import type { ApiResponse } from '@/types';

// GET - 게시물 상세 조회
export async function GET(
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

    // 게시물 조회
    const { data: post, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        author:users!posts_author_id_fkey(id, name, employee_id, team, position, profile_image_url)
      `
      )
      .eq('id', id)
      .single();

    if (error || !post) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '게시물을 찾을 수 없습니다.', code: 'NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // 권한 부여 여부 확인
    const { data: permission } = await supabase
      .from('post_permissions')
      .select('id')
      .eq('post_id', post.id)
      .eq('user_id', currentUser.id)
      .single();

    const hasGrantedPermission = !!permission;

    // 권한 확인
    if (!canViewPost(currentUser, post, hasGrantedPermission)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '조회 권한이 없습니다.', code: 'FORBIDDEN' },
        },
        { status: 403 }
      );
    }

    // 조회수 증가
    await supabase
      .from('posts')
      .update({ view_count: post.view_count + 1 })
      .eq('id', id);

    // 감사 로그
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'VIEW_POST',
      target_type: 'POST',
      target_id: post.id,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { ...post, view_count: post.view_count + 1 },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}

// PUT - 게시물 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient() as any;
    const body = await request.json();

    const { title, content, category, is_public } = body;

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

    // 기존 게시물 조회
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '게시물을 찾을 수 없습니다.', code: 'NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // 수정 권한 확인
    if (!canEditPost(currentUser, existingPost)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '수정 권한이 없습니다.', code: 'FORBIDDEN' },
        },
        { status: 403 }
      );
    }

    // 게시물 수정
    const { data: post, error } = await supabase
      .from('posts')
      .update({
        title,
        content,
        category,
        is_public,
      })
      .eq('id', id)
      .select(
        `
        *,
        author:users!posts_author_id_fkey(id, name, employee_id, team, position)
      `
      )
      .single();

    if (error) throw error;

    // 감사 로그
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'UPDATE_POST',
      target_type: 'POST',
      target_id: post.id,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: post,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}

// DELETE - 게시물 삭제
export async function DELETE(
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

    // 기존 게시물 조회
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '게시물을 찾을 수 없습니다.', code: 'NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // 삭제 권한 확인
    if (!canEditPost(currentUser, existingPost)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '삭제 권한이 없습니다.', code: 'FORBIDDEN' },
        },
        { status: 403 }
      );
    }

    // 게시물 삭제 (CASCADE로 권한도 자동 삭제됨)
    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) throw error;

    // 감사 로그
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'DELETE_POST',
      target_type: 'POST',
      target_id: id,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: '게시물이 삭제되었습니다.' },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}
