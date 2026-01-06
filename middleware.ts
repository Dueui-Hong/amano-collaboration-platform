// ============================================
// Next.js Middleware - RBAC 및 인증 처리 (보안 강화)
// ============================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  // 쿠키에서 세션 정보 가져오기
  const userSessionCookie = request.cookies.get('user_session');
  const userIdCookie = request.cookies.get('user_id');

  // 보안 강화: 두 쿠키가 모두 있어야 인증된 것으로 간주
  let userSession = null;
  if (userSessionCookie && userIdCookie) {
    try {
      userSession = JSON.parse(userSessionCookie.value);
      
      // 세션 유효성 검증
      if (!userSession.id || userSession.id !== userIdCookie.value) {
        // 세션과 user_id가 일치하지 않으면 세션 무효화
        console.warn('Session validation failed: ID mismatch');
        userSession = null;
      }
    } catch (error) {
      // JSON 파싱 실패 시 세션 무효화
      console.error('Session parsing failed:', error);
      userSession = null;
    }
  }

  // 1. 인증이 필요한 경로 체크
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !userSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    
    // 세션이 유효하지 않으면 쿠키 삭제
    const response = NextResponse.redirect(url);
    response.cookies.delete('user_id');
    response.cookies.delete('user_session');
    return response;
  }

  // 2. 로그인한 사용자는 로그인 페이지 접근 불가
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isAuthRoute && userSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // 3. 역할 기반 권한 체크
  if (userSession && isProtectedRoute) {
    const userRole = userSession.role;

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
      url.searchParams.set('error', 'unauthorized');
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
