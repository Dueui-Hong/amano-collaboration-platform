'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';

export default function PostsPage() {
  const [posts] = useState([
    { id: 1, title: '2026년 신년 인사', category: '공지사항', is_public: true, view_count: 45, created_at: '2026-01-02T09:00:00', author: { name: '김부장' } },
    { id: 2, title: 'Q4 실적 보고서', category: '업무자료', is_public: false, view_count: 12, created_at: '2026-01-05T14:30:00', author: { name: '박팀장' } },
  ]);

  const [selectedCategory, setSelectedCategory] = useState('전체');
  const categories = ['전체', '공지사항', '업무자료', '회의록', '기타'];

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">게시판</h1>
          <p className="mt-1 text-sm text-gray-600">팀 내 공지사항 및 업무 자료를 공유합니다</p>
        </div>
        <Link
          href="/posts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + 새 게시물 작성
        </Link>
      </div>

      <div className="mb-6 flex space-x-4">
        <input
          type="text"
          placeholder="게시물 검색..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성자</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">조회수</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성일</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link href={`/posts/${post.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                    {post.title}
                    {!post.is_public && (
                      <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">비공개</span>
                    )}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.author.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.view_count}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString('ko-KR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">등록된 게시물이 없습니다.</p>
            <Link
              href="/posts/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              첫 게시물 작성하기
            </Link>
          </div>
        )}
      </div>
    </DashboardLayoutWrapper>
  );
}
