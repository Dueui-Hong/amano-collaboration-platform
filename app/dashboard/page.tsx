'use client';

// ============================================
// Dashboard Page - 메인 대시보드
// ============================================

import { useEffect, useState } from 'react';
import {
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  total_reports_this_week: number;
  submitted_reports: number;
  approved_reports: number;
  pending_reports: number;
  total_schedules_this_month: number;
  total_posts_this_month: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 실제로는 API에서 통계 데이터를 가져와야 함
    // 여기서는 더미 데이터 사용
    setTimeout(() => {
      setStats({
        total_reports_this_week: 7,
        submitted_reports: 5,
        approved_reports: 3,
        pending_reports: 2,
        total_schedules_this_month: 12,
        total_posts_this_month: 8,
      });
      setIsLoading(false);
    }, 500);
  }, []);

  const statsCards = [
    {
      title: '이번 주 보고서',
      value: stats?.total_reports_this_week || 0,
      icon: ClipboardDocumentCheckIcon,
      color: 'blue',
      description: `제출: ${stats?.submitted_reports || 0} / 승인: ${
        stats?.approved_reports || 0
      }`,
    },
    {
      title: '대기 중 보고서',
      value: stats?.pending_reports || 0,
      icon: DocumentTextIcon,
      color: 'yellow',
      description: '검토 대기 중',
    },
    {
      title: '이달 일정',
      value: stats?.total_schedules_this_month || 0,
      icon: CalendarIcon,
      color: 'green',
      description: '등록된 일정',
    },
    {
      title: '이달 게시물',
      value: stats?.total_posts_this_month || 0,
      icon: DocumentTextIcon,
      color: 'purple',
      description: '새 게시물',
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'yellow':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'green':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'purple':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-2 text-gray-600">
          아마노코리아 영업기획 및 관리본부 통합 현황
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card) => {
          const Icon = card.icon;
          const colorClasses = getColorClasses(card.color);

          return (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-lg border ${colorClasses}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {card.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {card.value}
              </p>
              <p className="text-xs text-gray-500">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* 최근 활동 & 공지사항 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 보고서 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            최근 보고서
          </h2>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      2026-01-{(item + 5).toString().padStart(2, '0')} 주간
                      보고서
                    </p>
                    <p className="text-xs text-gray-500">
                      {item === 1 ? '승인됨' : '검토 대기'}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    item === 1
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {item === 1 ? '승인' : '대기'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 다가오는 일정 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            다가오는 일정
          </h2>
          <div className="space-y-3">
            {[
              { date: '01/15', title: '1분기 전략회의', time: '14:00' },
              { date: '01/20', title: '기획홍보팀 정기 미팅', time: '10:00' },
              { date: '01/22', title: '수주관리팀 주간 회의', time: '15:00' },
            ].map((schedule, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="text-center">
                  <p className="text-xs text-gray-500">2026</p>
                  <p className="text-lg font-bold text-blue-600">
                    {schedule.date}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {schedule.title}
                  </p>
                  <p className="text-xs text-gray-500">{schedule.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-left">
          <ClipboardDocumentCheckIcon className="w-6 h-6 mb-2" />
          <p className="font-semibold">주간 보고서 작성</p>
          <p className="text-sm opacity-90 mt-1">새로운 보고서 작성하기</p>
        </button>

        <button className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors text-left">
          <CalendarIcon className="w-6 h-6 mb-2" />
          <p className="font-semibold">일정 등록</p>
          <p className="text-sm opacity-90 mt-1">새로운 일정 추가하기</p>
        </button>

        <button className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors text-left">
          <DocumentTextIcon className="w-6 h-6 mb-2" />
          <p className="font-semibold">게시물 작성</p>
          <p className="text-sm opacity-90 mt-1">공지사항 또는 자료 등록</p>
        </button>
      </div>
    </div>
  );
}
