'use client';

// ============================================
// Dashboard Layout - Sidebar & Navigation
// ============================================

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface User {
  name: string;
  employee_id: string;
  role: string;
  team: string;
  position?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // 사용자 정보 가져오기
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        const data = await response.json();
        setUser(data.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigation = [
    {
      name: '대시보드',
      href: '/dashboard',
      icon: HomeIcon,
      roles: ['DEPARTMENT_HEAD', 'TEAM_LEADER', 'TEAM_MEMBER'],
    },
    {
      name: '일정 관리',
      href: '/schedules',
      icon: CalendarIcon,
      roles: ['DEPARTMENT_HEAD', 'TEAM_LEADER', 'TEAM_MEMBER'],
    },
    {
      name: '주간 보고서',
      href: '/reports',
      icon: ClipboardDocumentCheckIcon,
      roles: ['DEPARTMENT_HEAD', 'TEAM_LEADER', 'TEAM_MEMBER'],
    },
    {
      name: '게시판',
      href: '/posts',
      icon: DocumentTextIcon,
      roles: ['DEPARTMENT_HEAD', 'TEAM_LEADER', 'TEAM_MEMBER'],
    },
    {
      name: '시스템 설정',
      href: '/settings',
      icon: Cog6ToothIcon,
      roles: ['DEPARTMENT_HEAD'],
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const getRoleName = (role: string) => {
    switch (role) {
      case 'DEPARTMENT_HEAD':
        return '부서장';
      case 'TEAM_LEADER':
        return '팀장';
      case 'TEAM_MEMBER':
        return '팀원';
      default:
        return role;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 데스크톱 사이드바 */}
      <aside
        className={`hidden md:flex md:flex-col transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200`}
      >
        {/* 로고 영역 */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {isSidebarOpen && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">아마노코리아</h1>
              <p className="text-xs text-gray-500">통합 협업 플랫폼</p>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isSidebarOpen ? (
              <XMarkIcon className="w-5 h-5" />
            ) : (
              <Bars3Icon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${!isSidebarOpen && 'justify-center'}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* 사용자 프로필 */}
        <div className="border-t border-gray-200 p-4">
          <div className={`${!isSidebarOpen && 'flex justify-center'}`}>
            {isSidebarOpen ? (
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user.team} · {getRoleName(user.role)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {user.employee_id}
                </p>
              </div>
            ) : (
              <UserCircleIcon className="w-8 h-8 text-gray-600" />
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`mt-3 w-full flex items-center ${
              isSidebarOpen ? 'justify-start' : 'justify-center'
            } px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors`}
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="ml-2">로그아웃</span>}
          </button>
        </div>
      </aside>

      {/* 모바일 사이드바 */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white">
            {/* 모바일 사이드바 내용 (데스크톱과 동일) */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  아마노코리아
                </h1>
                <p className="text-xs text-gray-500">통합 협업 플랫폼</p>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-gray-200 p-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user.team} · {getRoleName(user.role)}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 w-full flex items-center justify-start px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
                <span className="ml-2">로그아웃</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 모바일 헤더 */}
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">아마노코리아</h1>
          <div className="w-10"></div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
