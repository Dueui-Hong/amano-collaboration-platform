// ============================================
// File Upload API (Supabase Storage)
// POST /api/upload - 파일 업로드
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
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

    // FormData 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '파일을 선택해주세요.', code: 'MISSING_FILE' },
        },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '파일 크기는 10MB 이하여야 합니다.', code: 'FILE_TOO_LARGE' },
        },
        { status: 400 }
      );
    }

    // 파일 확장자 검증
    const allowedExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.ppt',
      '.pptx',
      '.zip',
      '.txt',
    ];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: '지원하지 않는 파일 형식입니다.',
            code: 'INVALID_FILE_TYPE',
          },
        },
        { status: 400 }
      );
    }

    // 파일명 생성 (중복 방지)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${randomString}-${safeFileName}`;
    const filePath = `${folder}/${fileName}`;

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { message: '파일 업로드에 실패했습니다.', code: 'UPLOAD_FAILED', details: error },
        },
        { status: 500 }
      );
    }

    // 공개 URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from('uploads').getPublicUrl(filePath);

    // 사용자 정보 조회
    const { data: currentUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    // 감사 로그
    if (currentUser) {
      await supabase.from('audit_logs').insert({
        user_id: currentUser.id,
        action: 'UPLOAD_FILE',
        details: {
          file_name: file.name,
          file_size: file.size,
          file_path: filePath,
        },
      });
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_url: publicUrl,
          uploaded_at: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}
