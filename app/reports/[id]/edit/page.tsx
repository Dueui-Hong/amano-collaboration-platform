'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';

export default function EditReportPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    week_start_date: '',
    week_end_date: '',
    this_week_work: '',
    next_week_plan: '',
    issues: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const report = data.data;
        setFormData({
          week_start_date: report.week_start_date,
          week_end_date: report.week_end_date,
          this_week_work: report.this_week_work,
          next_week_plan: report.next_week_plan,
          issues: report.issues || '',
        });
      } else {
        alert('보고서를 찾을 수 없습니다.');
        router.push('/reports');
      }
    } catch (error) {
      alert('데이터 로드 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/reports/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('수정되었습니다!');
        router.push(`/reports/${params.id}`);
      } else {
        const error = await response.json();
        alert(`오류: ${error.error?.message || '수정 실패'}`);
      }
    } catch (error) {
      alert('서버 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
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

  return (
    <DashboardLayoutWrapper>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">주간 보고서 수정</h1>
          <p className="mt-1 text-sm text-gray-600">보고서 내용을 수정합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.week_start_date}
                onChange={(e) => setFormData({ ...formData, week_start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.week_end_date}
                onChange={(e) => setFormData({ ...formData, week_end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이번 주 수행 업무 <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={formData.this_week_work}
              onChange={(e) => setFormData({ ...formData, this_week_work: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              다음 주 계획 <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={formData.next_week_plan}
              onChange={(e) => setFormData({ ...formData, next_week_plan: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이슈 및 건의사항
            </label>
            <textarea
              rows={4}
              value={formData.issues}
              onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? '저장 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayoutWrapper>
  );
}
