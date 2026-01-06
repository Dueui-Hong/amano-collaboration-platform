'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  employee_id: string;
  name: string;
  role: string;
  team: string;
}

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
}

export default function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/me', {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => setUser(data.data))
      .catch(() => router.push('/login'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/login');
  };

  const navigation = [
    { name: '대시보드', href: '/dashboard', icon: '🏠', roles: ['DEPARTMENT_HEAD', 'TEAM_LEADER', 'TEAM_MEMBER'] },
    { name: '일정 관리', href: '/schedules', icon: '📅', roles: ['DEPARTMENT_HEAD', 'TEAM_LEADER', 'TEAM_MEMBER'] },
    { name: '주간 보고서', href: '/reports', icon: '📝', roles: ['DEPARTMENT_HEAD', 'TEAM_LEADER', 'TEAM_MEMBER'] },
    { name: '게시판', href: '/posts', icon: '📋', roles: ['DEPARTMENT_HEAD', 'TEAM_LEADER', 'TEAM_MEMBER'] },
    { name: '시스템 설정', href: '/settings', icon: '⚙️', roles: ['DEPARTMENT_HEAD'] },
  ];

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      DEPARTMENT_HEAD: '부서장',
      TEAM_LEADER: '팀장',
      TEAM_MEMBER: '팀원',
    };
    return roleMap[role] || role;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredNavigation = navigation.filter((item) => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 데스크톱 사이드바 */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow bg-blue-700 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 py-5 bg-blue-800">
            <h1 className="text-xl font-bold text-white">아마노코리아</h1>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-blue-800 text-white'
                      : 'text-blue-100 hover:bg-blue-600'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          {/* 사용자 정보 */}
          <div className="flex-shrink-0 flex bg-blue-800 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <div className="inline-block h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">{user.name[0]}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs font-medium text-blue-200">{getRoleDisplayName(user.role)}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      <div className="md:hidden">
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-blue-700 px-4 py-3">
          <h1 className="text-lg font-bold text-white">아마노코리아</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-blue-700">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-3 bg-blue-800">
                <h1 className="text-lg font-bold text-white">아마노코리아</h1>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex-1 px-4 py-4 space-y-2">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-base font-medium rounded-md ${
                      pathname === item.href
                        ? 'bg-blue-800 text-white'
                        : 'text-blue-100 hover:bg-blue-600'
                    }`}
                  >
                    <span className="mr-3 text-xl">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="px-4 py-4 bg-blue-800">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-base font-medium text-white">{user.name[0]}</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-white">{user.name}</p>
                    <p className="text-sm text-blue-200">{getRoleDisplayName(user.role)}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-white rounded-md hover:bg-blue-50"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 메인 컨텐츠 */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6 md:py-6 mt-14 md:mt-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
