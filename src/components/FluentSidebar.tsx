/**
 * 공통 사이드바 컴포넌트 - Fluent Design 2.0
 * - 관리자/팀원 모두 사용
 * - 업무 현황 / 업무 배정 / 자료 게시판
 * - Neumorphism Level 4
 */

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { fluentColors, fluentShadows, fluentRadius } from '@/styles/fluent';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ArticleIcon from '@mui/icons-material/Article';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface SidebarProps {
  userRole: 'admin' | 'member';
  currentView?: number; // 관리자용: 0=업무현황, 1=업무배정
  onViewChange?: (view: number) => void; // 관리자용 뷰 변경 콜백
}

export default function FluentSidebar({ userRole, currentView = 0, onViewChange }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isBoard = pathname === '/board';
  const isDashboard = pathname === '/dashboard';
  const isAdminDashboard = pathname === '/admin/dashboard';

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const menuItems = userRole === 'admin' ? [
    { id: 'status', label: '업무 현황', icon: DashboardIcon, view: 0, path: '/admin/dashboard' },
    { id: 'assign', label: '업무 배정', icon: AssignmentTurnedInIcon, view: 1, path: '/admin/dashboard' },
    { id: 'board', label: '자료 게시판', icon: ArticleIcon, path: '/board' },
  ] : [
    { id: 'dashboard', label: '내 업무', icon: CalendarTodayIcon, path: '/dashboard' },
    { id: 'board', label: '자료 게시판', icon: ArticleIcon, path: '/board' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.menuList}>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = userRole === 'admin'
            ? (item.path === '/board' ? isBoard : (isAdminDashboard && currentView === item.view))
            : (item.path === pathname);

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.path) {
                  // 관리자가 게시판에서 대시보드로 이동하는 경우 뷰 저장
                  if (userRole === 'admin' && item.path === '/admin/dashboard' && item.view !== undefined) {
                    localStorage.setItem('adminDashboardView', String(item.view));
                  }
                  handleNavigate(item.path);
                } else if (onViewChange && item.view !== undefined) {
                  // 현재 관리자 대시보드 내에서 뷰 변경
                  onViewChange(item.view);
                }
              }}
              style={{
                ...styles.menuItem,
                ...(isActive ? styles.menuItemActive : {}),
                marginBottom: index < menuItems.length - 1 ? '12px' : '0', // 간격 줄임
              }}
            >
              <div style={styles.iconContainer}>
                <Icon style={styles.icon} />
              </div>
              <span style={styles.label}>{item.label}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02); /* 크기 변화 줄임 */
          }
        }
      `}</style>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '240px',
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${fluentColors.neutral[0]} 0%, ${fluentColors.neutral[10]} 100%)`,
    borderRight: `1px solid ${fluentColors.neutral[30]}`,
    boxShadow: fluentShadows.neumorph2,
    padding: '24px 16px',
    position: 'sticky',
    top: 0,
    left: 0,
    zIndex: 10,
  },

  menuList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px', // 간격 줄임
  },

  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px', // 패딩 줄임
    background: fluentColors.neutral[0],
    border: `2px solid ${fluentColors.neutral[30]}`,
    borderRadius: fluentRadius.lg,
    cursor: 'pointer',
    transition: 'all 0.2s ease', // 트랜지션 시간 줄임
    boxShadow: fluentShadows.neumorph2,
    outline: 'none',
    fontSize: '15px',
    fontWeight: 600,
    color: fluentColors.neutral[80],
  },

  menuItemActive: {
    background: `linear-gradient(135deg, ${fluentColors.primary[500]}, ${fluentColors.primary[700]})`,
    color: '#FFFFFF',
    borderColor: fluentColors.primary[700],
    boxShadow: fluentShadows.neumorph3,
    animation: 'pulse 2s ease-in-out infinite',
  },

  iconContainer: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: fluentRadius.md,
    background: 'rgba(255, 255, 255, 0.15)',
  },

  icon: {
    fontSize: '24px',
  },

  label: {
    flex: 1,
    textAlign: 'left',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
};
