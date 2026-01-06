'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';

interface Schedule {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  type: string;
  color: string;
  created_at: string;
  author: {
    name: string;
    employee_id: string;
  };
}

export default function ScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, [params.id]);

  const fetchSchedule = async () => {
    try {
      const response = await fetch(`/api/schedules/${params.id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSchedule(data.data);
      } else {
        alert('일정을 찾을 수 없습니다.');
        router.push('/schedules');
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
      const response = await fetch(`/api/schedules/${params.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        alert('삭제되었습니다.');
        router.push('/schedules');
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

  if (!schedule) {
    return (
      <DashboardLayoutWrapper>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">일정을 찾을 수 없습니다.</p>
          <Link href="/schedules" className="text-blue-600 hover:text-blue-800">
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
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{schedule.title}</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              schedule.type === 'PUBLIC' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {schedule.type === 'PUBLIC' ? '공개' : '비공개'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href={`/schedules/${params.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              수정
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>

        {/* 일정 정보 */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">일정 시간</h3>
            <div className="flex items-center space-x-6">
              <div>
                <p className="text-xs text-gray-500">시작</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(schedule.start_date).toLocaleString('ko-KR')}
                </p>
              </div>
              <span className="text-gray-400">→</span>
              <div>
                <p className="text-xs text-gray-500">종료</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(schedule.end_date).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
          </div>

          {schedule.description && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">설명</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{schedule.description}</p>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">작성자</h3>
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-900">{schedule.author.name}</p>
              <p className="text-sm text-gray-500">{schedule.author.employee_id}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-xs text-gray-500">색상</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: schedule.color }}></div>
                  <p className="text-sm text-gray-600">{schedule.color}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">작성일</p>
                <p className="text-sm text-gray-600">{new Date(schedule.created_at).toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-6">
          <Link
            href="/schedules"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            ← 목록으로
          </Link>
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
