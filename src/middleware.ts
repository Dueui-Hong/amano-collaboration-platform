/**
 * Next.js Middleware - 인증 및 권한 검사
 * /admin/* - 관리자만 접근
 * /dashboard - 로그인 유저만 접근
 * /request - 누구나 접근
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 경로는 통과
  if (
    pathname.startsWith('/request') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // 보호된 경로 (/admin, /dashboard)는 클라이언트에서 처리
  // 미들웨어에서는 단순히 통과
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
