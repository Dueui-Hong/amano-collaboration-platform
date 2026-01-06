'use client';

// ============================================
// Dashboard Page - 메인 대시보드
// ============================================

import { useEffect, useState } from 'react';

interface User {
  id: string;
  employee_id: string;
  name: string;
  role: string;
  team: string;
  email: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 사용자 정보 가져오기
    fetch('/api/auth/me', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch user:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">사용자 정보를 불러올 수 없습니다.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            다시 로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-2 text-gray-600">
          아마노코리아 영업기획 및 관리본부 통합 현황
        </p>
      </div>

      {/* 사용자 정보 카드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">환영합니다!</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">이름</p>
            <p className="text-lg font-medium text-gray-900">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">사원번호</p>
            <p className="text-lg font-medium text-gray-900">{user.employee_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">소속</p>
            <p className="text-lg font-medium text-gray-900">{user.team}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">역할</p>
            <p className="text-lg font-medium text-gray-900">
              {user.role === 'DEPARTMENT_HEAD' ? '부서장' : 
               user.role === 'TEAM_LEADER' ? '팀장' : '팀원'}
            </p>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-1">이번 주 보고서</h3>
          <p className="text-3xl font-bold text-gray-900">7</p>
          <p className="text-xs text-gray-500 mt-2">제출: 5 / 승인: 3</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-1">대기 중 보고서</h3>
          <p className="text-3xl font-bold text-gray-900">2</p>
          <p className="text-xs text-gray-500 mt-2">검토 대기 중</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-1">이달 일정</h3>
          <p className="text-3xl font-bold text-gray-900">12</p>
          <p className="text-xs text-gray-500 mt-2">등록된 일정</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-1">이달 게시물</h3>
          <p className="text-3xl font-bold text-gray-900">8</p>
          <p className="text-xs text-gray-500 mt-2">새 게시물</p>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 보고서 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 보고서</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    2026-01-{(item + 5).toString().padStart(2, '0')} 주간 보고서
                  </p>
                  <p className="text-xs text-gray-500">
                    {item === 1 ? '승인됨' : '검토 대기'}
                  </p>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">다가오는 일정</h2>
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
                <div className="text-center min-w-[60px]">
                  <p className="text-xs text-gray-500">2026</p>
                  <p className="text-lg font-bold text-blue-600">{schedule.date}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{schedule.title}</p>
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
          <p className="font-semibold">📋 주간 보고서 작성</p>
          <p className="text-sm opacity-90 mt-1">새로운 보고서 작성하기</p>
        </button>

        <button className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors text-left">
          <p className="font-semibold">📅 일정 등록</p>
          <p className="text-sm opacity-90 mt-1">새로운 일정 추가하기</p>
        </button>

        <button className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors text-left">
          <p className="font-semibold">📝 게시물 작성</p>
          <p className="text-sm opacity-90 mt-1">공지사항 또는 자료 등록</p>
        </button>
      </div>
    </div>
  );
}

// 중복 컴포넌트 제거됨 - 첫 번째 컴포넌트만 사용
