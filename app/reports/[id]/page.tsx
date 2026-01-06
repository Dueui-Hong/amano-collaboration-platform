'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';

interface Report {
  id: string;
  week_start_date: string;
  week_end_date: string;
  this_week_work: string;
  next_week_plan: string;
  issues: string | null;
  status: string;
  created_at: string;
  author: {
    name: string;
    employee_id: string;
    team: string;
  };
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [params.id]);

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports/${params.id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setReport(data.data);
      } else {
        alert('보고서를 찾을 수 없습니다.');
        router.push('/reports');
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
      const response = await fetch(`/api/reports/${params.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        alert('삭제되었습니다.');
        router.push('/reports');
      } else {
        alert('삭제 실패');
      }
    } catch (error) {
      alert('서버 오류');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      DRAFT: { label: '작성중', color: 'bg-gray-100 text-gray-800' },
      SUBMITTED: { label: '제출됨', color: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { label: '승인됨', color: 'bg-green-100 text-green-800' },
      REJECTED: { label: '반려됨', color: 'bg-red-100 text-red-800' },
    };
    const badge = badges[status] || badges.DRAFT;
    return <span className={`px-3 py-1 text-sm font-medium rounded-full ${badge.color}`}>{badge.label}</span>;
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

  if (!report) {
    return (
      <DashboardLayoutWrapper>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">보고서를 찾을 수 없습니다.</p>
          <Link href="/reports" className="text-blue-600 hover:text-blue-800">
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">주간 보고서 상세</h1>
            <p className="text-sm text-gray-600">
              {report.week_start_date} ~ {report.week_end_date}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(report.status)}
            <Link
              href={`/reports/${params.id}/edit`}
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

        {/* 작성자 정보 */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">작성자 정보</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">이름</p>
              <p className="text-sm font-medium text-gray-900">{report.author.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">사원번호</p>
              <p className="text-sm font-medium text-gray-900">{report.author.employee_id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">소속</p>
              <p className="text-sm font-medium text-gray-900">{report.author.team}</p>
            </div>
          </div>
        </div>

        {/* 보고서 내용 */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">이번 주 수행 업무</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{report.this_week_work}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">다음 주 계획</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{report.next_week_plan}</p>
            </div>
          </div>

          {report.issues && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">이슈 및 건의사항</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{report.issues}</p>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <p className="text-xs text-gray-500">
              작성일: {new Date(report.created_at).toLocaleString('ko-KR')}
            </p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-6 flex justify-between">
          <Link
            href="/reports"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            ← 목록으로
          </Link>
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
