'use client';

// ============================================
// Settings Page - 시스템 설정 (부서장 전용)
// ============================================

import { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">시스템 설정</h1>
        <p className="mt-2 text-gray-600">
          시스템 전반의 설정을 관리합니다. (부서장 전용)
        </p>
      </div>

      {/* 설정 카테고리 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 기본 설정 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Cog6ToothIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            기본 설정
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            시스템 타이틀, 로고 등 기본 설정을 관리합니다.
          </p>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            설정하기
          </button>
        </div>

        {/* 보안 설정 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            보안 설정
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            비밀번호 정책, 세션 만료 시간 등을 관리합니다.
          </p>
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            설정하기
          </button>
        </div>

        {/* 사용자 관리 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Cog6ToothIcon className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            사용자 관리
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            사용자 계정 생성, 삭제, 권한 관리를 수행합니다.
          </p>
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            관리하기
          </button>
        </div>
      </div>

      {/* 알림 */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          ⚠️ 시스템 설정 변경 시 주의가 필요합니다. 변경 사항은 즉시 전체 시스템에 적용됩니다.
        </p>
      </div>
    </div>
  );
}
