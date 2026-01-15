/**
 * 공개 요청 폼 페이지
 * 로그인 불필요 - 외부 부서에서 업무 요청 시 사용
 * 파일 업로드 포함
 */

'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function RequestPage() {
  const [formData, setFormData] = useState({
    title: '',
    requester_dept: '',
    requester_name: '',
    category: '디자인' as '기획' | '디자인' | '영상' | '3D MAX' | '맵작업' | '시설점검',
    description: '',
    due_date: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (): Promise<string[]> => {
    const imageUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('task-images')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`파일 업로드 실패: ${uploadError.message}`);
      }

      const { data } = supabase.storage.from('task-images').getPublicUrl(filePath);
      imageUrls.push(data.publicUrl);
    }

    return imageUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      // 1. 파일 업로드
      const imageUrls = files.length > 0 ? await uploadFiles() : [];

      // 2. 업무 생성
      const { error: insertError } = await supabase.from('tasks').insert({
        ...formData,
        image_urls: imageUrls,
        status: 'Unassigned',
      });

      if (insertError) {
        throw new Error(`업무 생성 실패: ${insertError.message}`);
      }

      setSuccess(true);
      
      // 폼 초기화
      setFormData({
        title: '',
        requester_dept: '',
        requester_name: '',
        category: '디자인',
        description: '',
        due_date: '',
      });
      setFiles([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            아마노코리아 기획홍보팀
          </h1>
          <p className="text-xl text-gray-600">업무 요청하기</p>
          <p className="mt-4 text-sm text-gray-500">
            디자인, 영상, 3D, 기획 등 업무를 요청해주세요
          </p>
        </div>

        {/* 폼 */}
        <div className="bg-white shadow-xl rounded-lg p-8">
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              ✅ 업무가 성공적으로 등록되었습니다!
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 요청 부서 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                요청 부서 *
              </label>
              <input
                type="text"
                name="requester_dept"
                value={formData.requester_dept}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: 시설관리팀"
              />
            </div>

            {/* 담당자명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                담당자명 *
              </label>
              <input
                type="text"
                name="requester_name"
                value={formData.requester_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: 홍길동"
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="디자인">디자인</option>
                <option value="영상">영상</option>
                <option value="3D MAX">3D MAX</option>
                <option value="맵작업">맵작업</option>
                <option value="기획">기획</option>
                <option value="시설점검">시설점검</option>
              </select>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: 주차장 안내판 디자인"
              />
            </div>

            {/* 마감일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                마감일 *
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 상세내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상세내용
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="업무 상세 내용을 입력해주세요"
              />
            </div>

            {/* 파일 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                첨부 파일 (이미지)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {files.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  {files.length}개 파일 선택됨
                </p>
              )}
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? '등록 중...' : '업무 요청하기'}
            </button>
          </form>
        </div>

        {/* 푸터 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>문의: 기획홍보팀 (내선: 1234)</p>
        </div>
      </div>
    </div>
  );
}
