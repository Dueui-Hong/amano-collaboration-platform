'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';

export default function DashboardPage() {
  const [stats] = useState({
    total_reports_this_week: 7,
    submitted_reports: 5,
    approved_reports: 3,
    pending_reports: 2,
    total_schedules_this_month: 12,
    total_posts_this_month: 8,
  });

  return (
    <DashboardLayoutWrapper>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-2 text-sm text-gray-600">
          아마노코리아 영업기획 및 관리본부에 오신 것을 환영합니다
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">이번 주 보고서</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.total_reports_this_week}건</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-gray-600">제출: {stats.submitted_reports} / 승인: {stats.approved_reports}</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">대기 중 보고서</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.pending_reports}건</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-yellow-600">검토 필요</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">이달 일정</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.total_schedules_this_month}건</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/schedules" className="font-medium text-blue-600 hover:text-blue-500">
                전체 보기 →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">이달 게시물</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.total_posts_this_month}건</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/posts" className="font-medium text-blue-600 hover:text-blue-500">
                전체 보기 →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 액션</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/reports/new"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
          >
            <div className="flex-shrink-0">
              <span className="text-3xl">✍️</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">주간 보고서 작성</p>
              <p className="text-sm text-gray-500">새 보고서 작성하기</p>
            </div>
          </Link>

          <Link
            href="/schedules/new"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
          >
            <div className="flex-shrink-0">
              <span className="text-3xl">📆</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">일정 등록</p>
              <p className="text-sm text-gray-500">새 일정 추가하기</p>
            </div>
          </Link>

          <Link
            href="/posts/new"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
          >
            <div className="flex-shrink-0">
              <span className="text-3xl">📝</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">게시물 작성</p>
              <p className="text-sm text-gray-500">새 게시물 등록하기</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">최근 보고서</h3>
          <div className="space-y-4">
            {[
              { date: '2026-01-06', title: '주간 보고서', status: '승인됨', statusColor: 'green' },
              { date: '2026-01-07', title: '주간 보고서', status: '대기', statusColor: 'yellow' },
              { date: '2026-01-08', title: '주간 보고서', status: '대기', statusColor: 'yellow' },
            ].map((report, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{report.date} {report.title}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  report.statusColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
