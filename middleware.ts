// ============================================
// Next.js Middleware - RBAC 및 인증 처리
// ============================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createClient as createServerClient } from '@/lib/supabase/server';

// 인증이 필요한 경로
const PROTECTED_ROUTES = [
  '/dashboard',
  '/reports',
  '/schedules',
  '/posts',
  '/settings',
  '/admin',
];

// 부서장만 접근 가능한 경로
const ADMIN_ONLY_ROUTES = ['/admin', '/settings/system'];

// 팀장 이상만 접근 가능한 경로
const TEAM_LEADER_ROUTES = ['/reports/review', '/posts/permissions'];

// 로그인한 사용자는 접근 불가능한 경로
const AUTH_ROUTES = ['/login', '/'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Supabase 세션 업데이트
  const { supabaseResponse, user } = await updateSession(request);

  // 정적 파일 및 API 라우트는 제외
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon')
  ) {
    return supabaseResponse;
  }

  // 1. 인증이 필요한 경로 체크
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // 2. 로그인한 사용자는 로그인 페이지 접근 불가
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // 3. 역할 기반 권한 체크 (추가 DB 조회 필요)
  if (user && isProtectedRoute) {
    try {
      const supabase = await createServerClient();
      
      // 사용자 정보 조회
      const { data: userData, error } = await supabase
        .from('users')
        .select('role, team')
        .eq('id', user.id)
        .single() as any;

      if (error || !userData) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }

      const userRole = userData.role as string;

      // 부서장 전용 경로 체크
      const isAdminRoute = ADMIN_ONLY_ROUTES.some((route) =>
        pathname.startsWith(route)
      );

      if (isAdminRoute && userRole !== 'DEPARTMENT_HEAD') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        url.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(url);
      }

      // 팀장 이상 전용 경로 체크
      const isTeamLeaderRoute = TEAM_LEADER_ROUTES.some((route) =>
        pathname.startsWith(route)
      );

      if (
        isTeamLeaderRoute &&
        userRole !== 'DEPARTMENT_HEAD' &&
        userRole !== 'TEAM_LEADER'
      ) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        url.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Middleware auth error:', error);
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
