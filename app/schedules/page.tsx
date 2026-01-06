'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';

export default function SchedulesPage() {
  const [schedules] = useState([
    { id: 1, title: '1분기 전략회의', description: 'Q1 사업 전략 논의', start_date: '2026-01-15T14:00:00', end_date: '2026-01-15T16:00:00', type: 'PUBLIC', color: '#3B82F6' },
    { id: 2, title: '기획홍보팀 정기 미팅', description: '주간 업무 공유', start_date: '2026-01-20T10:00:00', end_date: '2026-01-20T11:00:00', type: 'PUBLIC', color: '#10B981' },
  ]);

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">일정 관리</h1>
          <p className="mt-1 text-sm text-gray-600">팀 일정을 관리하고 공유합니다</p>
        </div>
        <Link
          href="/schedules/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + 새 일정 등록
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {schedules.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📅</span>
            <p className="text-gray-500 mb-4">등록된 일정이 없습니다.</p>
            <Link
              href="/schedules/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              첫 일정 등록하기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="border-l-4 pl-4 py-3"
                style={{ borderColor: schedule.color }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{schedule.title}</h3>
                    {schedule.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{schedule.description}</p>
                    )}
                    <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                      <span>📅 {new Date(schedule.start_date).toLocaleDateString('ko-KR')}</span>
                      <span>⏰ {new Date(schedule.start_date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        schedule.type === 'PUBLIC' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {schedule.type === 'PUBLIC' ? '공개' : '비공개'}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/schedules/${schedule.id}`}
                    className="ml-4 text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    상세보기 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayoutWrapper>
  );
}
