/**
 * 공통 사이드바 컴포넌트 - Fluent Design 2.0
 * - 관리자/팀원 모두 사용
 * - 업무 현황 / 업무 배정 / 자료 게시판
 * - Neumorphism Level 4
 * - 완벽한 모바일 반응형 (햄버거 메뉴)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fluentColors, fluentShadows, fluentRadius } from '@/styles/fluent';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ArticleIcon from '@mui/icons-material/Article';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

interface SidebarProps {
  userRole: 'admin' | 'member';
  currentView?: number; // 관리자용: 0=업무현황, 1=업무배정
  onViewChange?: (view: number) => void; // 관리자용 뷰 변경 콜백
}

export default function FluentSidebar({ userRole, currentView = 0, onViewChange }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileOpen(false); // 데스크톱에서는 항상 열려있음
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isBoard = pathname === '/board';
  const isDashboard = pathname === '/dashboard';
  const isAdminDashboard = pathname === '/admin/dashboard';

  const handleNavigate = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false); // 모바일에서 페이지 이동 시 사이드바 닫기
    }
  };

  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
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
    <>
      {/* 모바일 햄버거 버튼 */}
      {isMobile && (
        <button
          onClick={toggleMobile}
          style={styles.mobileToggle as React.CSSProperties}
          aria-label="메뉴 열기/닫기"
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      )}

      {/* 모바일 오버레이 */}
      {isMobile && mobileOpen && (
        <div
          style={styles.overlay as React.CSSProperties}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
        style={{
          ...styles.container,
          ...(isMobile ? {
            position: 'fixed',
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease',
            zIndex: 1100,
          } : {}),
        } as React.CSSProperties}
      >
        <div style={styles.menuList as React.CSSProperties}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = userRole === 'admin'
              ? (item.path === '/board' ? isBoard : (isAdminDashboard && currentView === item.view))
              : (item.path === pathname);

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (userRole === 'admin' && item.view !== undefined) {
                    // 관리자의 업무 현황/배정 탭
                    if (isAdminDashboard) {
                      // 이미 관리자 대시보드에 있으면 뷰만 변경
                      if (onViewChange) {
                        onViewChange(item.view);
                      }
                      if (isMobile) {
                        setMobileOpen(false); // 모바일에서 뷰 변경 시 사이드바 닫기
                      }
                    } else {
                      // 다른 페이지에서 관리자 대시보드로 이동하는 경우 뷰 저장
                      localStorage.setItem('adminDashboardView', String(item.view));
                      handleNavigate('/admin/dashboard');
                    }
                  } else if (item.path) {
                    // 자료 게시판 등 다른 페이지로 이동
                    handleNavigate(item.path);
                  }
                }}
                style={{
                  ...styles.menuItem,
                  ...(isActive ? styles.menuItemActive : {}),
                  marginBottom: index < menuItems.length - 1 ? '12px' : '0',
                } as React.CSSProperties}
              >
                <div style={styles.iconContainer as React.CSSProperties}>
                  <Icon style={styles.icon as React.CSSProperties} />
                </div>
                <span style={styles.label as React.CSSProperties}>{item.label}</span>
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
              transform: scale(1.02);
            }
          }
        `}</style>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  mobileToggle: {
    position: 'fixed',
    top: '80px',
    left: '16px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${fluentColors.primary[500]}, ${fluentColors.primary[700]})`,
    border: 'none',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: fluentShadows.neumorph3,
    zIndex: 1050,
    transition: 'all 0.3s ease',
  },

  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1090,
  },

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
    gap: '12px',
  },

  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    background: fluentColors.neutral[0],
    border: `2px solid ${fluentColors.neutral[30]}`,
    borderRadius: fluentRadius.lg,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
