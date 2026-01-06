'use client';

// ============================================
// Schedules Page - 일정 관리
// ============================================

import { useState, useEffect } from 'react';
import {
  CalendarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface Schedule {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  type: 'PUBLIC' | 'PRIVATE';
  color: string;
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedules', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }

      const data = await response.json();
      setSchedules(data.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setIsLoading(false);
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">일정 관리</h1>
          <p className="mt-2 text-gray-600">팀 일정을 관리하고 공유합니다.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          새 일정 등록
        </button>
      </div>

      {/* 일정 목록 */}
      {schedules.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">등록된 일정이 없습니다.</p>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" />
            첫 일정 등록하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {schedule.title}
                </h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    schedule.type === 'PUBLIC'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {schedule.type === 'PUBLIC' ? '공개' : '비공개'}
                </span>
              </div>
              {schedule.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {schedule.description}
                </p>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span>
                  {new Date(schedule.start_date).toLocaleDateString('ko-KR')}
                  {' ~ '}
                  {new Date(schedule.end_date).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
