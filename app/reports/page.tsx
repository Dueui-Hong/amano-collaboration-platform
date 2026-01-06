'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';

export default function ReportsPage() {
  const [reports] = useState([
    { id: 1, week_start_date: '2026-01-06', week_end_date: '2026-01-10', this_week_work: '프로젝트 기획안 작성', status: 'SUBMITTED', author: { name: '김부장', employee_id: 'EMP001' } },
    { id: 2, week_start_date: '2025-12-30', week_end_date: '2026-01-03', this_week_work: 'Q4 실적 분석', status: 'APPROVED', author: { name: '박팀장', employee_id: 'EMP002' } },
  ]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      DRAFT: { label: '작성중', color: 'bg-gray-100 text-gray-800' },
      SUBMITTED: { label: '제출됨', color: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { label: '승인됨', color: 'bg-green-100 text-green-800' },
      REJECTED: { label: '반려됨', color: 'bg-red-100 text-red-800' },
    };
    const badge = badges[status] || badges.DRAFT;
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>{badge.label}</span>;
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">주간 보고서</h1>
          <p className="mt-1 text-sm text-gray-600">팀원들의 주간 업무 보고서를 확인하고 관리합니다</p>
        </div>
        <Link
          href="/reports/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + 새 보고서 작성
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="보고서 검색..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기간</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성자</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상세</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {report.week_start_date} ~ {report.week_end_date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{report.author.name}</div>
                  <div className="text-sm text-gray-500">{report.author.employee_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(report.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link href={`/reports/${report.id}`} className="text-blue-600 hover:text-blue-900">
                    상세보기 →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {reports.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">등록된 보고서가 없습니다.</p>
            <Link
              href="/reports/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              첫 보고서 작성하기
            </Link>
          </div>
        )}
      </div>
    </DashboardLayoutWrapper>
  );
}
