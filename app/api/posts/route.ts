// ============================================
// Posts API - List & Create
// GET /api/posts - 게시물 목록 조회
// POST /api/posts - 게시물 생성
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canViewPost } from '@/lib/auth/permissions';
import type { ApiResponse, Post } from '@/types';

// GET - 게시물 목록 조회
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
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 쿼리 빌더
    let query = supabase
      .from('posts')
      .select(
        `
        *,
        author:users!posts_author_id_fkey(id, name, employee_id, team, position, profile_image_url)
      `,
        { count: 'exact' }
      );

    // 권한에 따른 필터링
    if (currentUser.role === 'DEPARTMENT_HEAD') {
      // 부서장: 모든 게시물 조회 가능
    } else {
      // 나머지: 공개 게시물 + 본인이 작성한 게시물 + 권한 부여받은 게시물
      // 권한 부여받은 게시물 ID 조회
      const { data: permittedPosts } = await supabase
        .from('post_permissions')
        .select('post_id')
        .eq('user_id', currentUser.id);

      const permittedPostIds = permittedPosts?.map((p) => p.post_id) || [];

      // 조건: is_public=true OR author_id=current_user OR id IN (permitted_ids)
      if (permittedPostIds.length > 0) {
        query = query.or(
          `is_public.eq.true,author_id.eq.${currentUser.id},id.in.(${permittedPostIds.join(',')})`
        );
      } else {
        query = query.or(`is_public.eq.true,author_id.eq.${currentUser.id}`);
      }
    }

    // 추가 필터
    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);

    // 정렬 및 페이지네이션
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) throw error;

    // 감사 로그
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'VIEW_POSTS',
      details: { filters: { category, search, page, limit } },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: posts,
        meta: {
          total: count || 0,
          page,
          limit,
          total_pages: Math.ceil((count || 0) / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}

// POST - 게시물 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { title, content, category, is_public } = body;

    // 필수 필드 검증
    if (!title || !content) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '제목과 내용을 입력해주세요.', code: 'MISSING_FIELDS' },
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

    // 게시물 생성
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        category,
        is_public: is_public || false,
        author_id: currentUser.id,
      })
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
      action: 'CREATE_POST',
      target_type: 'POST',
      target_id: post.id,
      details: { title, category, is_public },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: post,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}
