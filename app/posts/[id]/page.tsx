'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  is_public: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  author: {
    name: string;
    employee_id: string;
    team: string;
  };
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [params.id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPost(data.data);
      } else {
        alert('게시물을 찾을 수 없습니다.');
        router.push('/posts');
      }
    } catch (error) {
      console.error(error);
      alert('데이터 로드 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        alert('삭제되었습니다.');
        router.push('/posts');
      } else {
        alert('삭제 실패');
      }
    } catch (error) {
      alert('서버 오류');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayoutWrapper>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayoutWrapper>
    );
  }

  if (!post) {
    return (
      <DashboardLayoutWrapper>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">게시물을 찾을 수 없습니다.</p>
          <Link href="/posts" className="text-blue-600 hover:text-blue-800">
            목록으로 돌아가기
          </Link>
        </div>
      </DashboardLayoutWrapper>
    );
  }

  return (
    <DashboardLayoutWrapper>
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
              {post.category}
            </span>
            {!post.is_public && (
              <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
                비공개
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
        </div>

        {/* 메타 정보 */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>작성자: {post.author.name}</span>
              <span>소속: {post.author.team}</span>
              <span>조회: {post.view_count}</span>
            </div>
            <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
          </div>
        </div>

        {/* 본문 */}
        <div className="bg-white shadow rounded-lg p-8 mb-6">
          <div className="prose max-w-none">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
          </div>
        </div>

        {/* 수정 정보 */}
        {post.updated_at !== post.created_at && (
          <p className="text-xs text-gray-500 mb-4">
            최종 수정: {new Date(post.updated_at).toLocaleString('ko-KR')}
          </p>
        )}

        {/* 하단 버튼 */}
        <div className="flex justify-between items-center">
          <Link
            href="/posts"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            ← 목록으로
          </Link>
          <div className="flex space-x-3">
            <Link
              href={`/posts/${params.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              수정
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
