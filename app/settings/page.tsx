'use client';

import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';

export default function SettingsPage() {
  return (
    <DashboardLayoutWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">시스템 설정</h1>
        <p className="mt-1 text-sm text-gray-600">시스템 환경을 설정하고 관리합니다</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">사용자 관리</h3>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-3">시스템 사용자 계정을 관리합니다</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                사용자 관리
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">권한 설정</h3>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-3">역할별 권한을 설정합니다</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                권한 설정
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">시스템 정보</h3>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">버전:</span>
                  <span className="ml-2 font-medium text-gray-900">1.0.0</span>
                </div>
                <div>
                  <span className="text-gray-500">배포일:</span>
                  <span className="ml-2 font-medium text-gray-900">2026-01-06</span>
                </div>
                <div>
                  <span className="text-gray-500">환경:</span>
                  <span className="ml-2 font-medium text-gray-900">Production</span>
                </div>
                <div>
                  <span className="text-gray-500">데이터베이스:</span>
                  <span className="ml-2 font-medium text-gray-900">Supabase (PostgreSQL)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
