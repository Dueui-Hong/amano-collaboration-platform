// ============================================
// Next.js Middleware - RBAC 및 JWT 인증
// ============================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

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
const ADMIN_ONLY_ROUTES = ['/admin', '/settings'];

// 팀장 이상만 접근 가능한 경로
const TEAM_LEADER_ROUTES = ['/reports/review', '/posts/permissions'];

// 로그인한 사용자는 접근 불가능한 경로
const AUTH_ROUTES = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 파일 및 API 라우트는 제외
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // 쿠키에서 JWT 토큰 가져오기
  const tokenCookie = request.cookies.get('token');
  const token = tokenCookie?.value;

  // JWT 토큰 검증
  let userPayload = null;
  if (token) {
    userPayload = await verifyToken(token);
  }

  // 1. 인증이 필요한 경로 체크
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !userPayload) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // 2. 로그인한 사용자는 로그인 페이지 접근 불가
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isAuthRoute && userPayload) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // 3. 역할 기반 권한 체크
  if (userPayload && isProtectedRoute) {
    const userRole = userPayload.role;

    // 부서장 전용 경로 체크
    const isAdminRoute = ADMIN_ONLY_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    if (isAdminRoute && userRole !== 'DEPARTMENT_HEAD') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // 팀장 이상 경로 체크
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
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
